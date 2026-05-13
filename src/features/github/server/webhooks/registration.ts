import { prisma } from "@/lib/prisma";
import {
  parseRepository,
  type GitHubWebhookRequestBody,
} from "@/features/github/validation/github-repository";

type GitHubWebhook = {
  config?: {
    url?: unknown;
  };
  id?: unknown;
};

type RegisterGitHubWebhookResult =
  | {
      body: {
        hookId: number | null;
        message: string;
        repository: { owner: string; repo: string };
      };
      status?: never;
    }
  | {
      body: { message: string };
      status: number;
    };

export async function registerGitHubWebhook({
  body,
  userId,
}: {
  body: GitHubWebhookRequestBody;
  userId: string;
}): Promise<RegisterGitHubWebhookResult> {
  const webhookUrl = process.env.GITHUB_WEBHOOK_URL;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return {
      body: { message: "GitHub 웹훅 환경변수가 설정되지 않았습니다." },
      status: 500,
    };
  }

  const repository = parseRepository(body);

  if (!repository) {
    return {
      body: { message: "GitHub ID와 Repository 정보를 올바르게 입력해주세요." },
      status: 400,
    };
  }

  const account = await prisma.account.findFirst({
    select: {
      access_token: true,
    },
    where: {
      provider: "github",
      userId,
    },
  });

  if (!account?.access_token) {
    return {
      body: {
        message:
          "GitHub access token을 찾을 수 없습니다. GitHub로 다시 로그인해주세요.",
      },
      status: 401,
    };
  }

  const webhook = await createGitHubWebhook({
    accessToken: account.access_token,
    owner: repository.owner,
    repo: repository.repo,
    webhookSecret,
    webhookUrl,
  });

  if (!webhook.ok) {
    return {
      body: { message: webhook.message },
      status: webhook.status,
    };
  }

  const repositoryFullName = `${repository.owner}/${repository.repo}`;

  await prisma.gitHubRepositoryWebhook.upsert({
    create: {
      hookId: webhook.hookId,
      repositoryFullName,
      userId,
    },
    update: {
      hookId: webhook.hookId,
      userId,
    },
    where: {
      repositoryFullName,
    },
  });

  return {
    body: {
      hookId: webhook.hookId,
      message: "GitHub 웹훅 연결이 완료되었습니다.",
      repository,
    },
  };
}

async function createGitHubWebhook({
  accessToken,
  owner,
  repo,
  webhookSecret,
  webhookUrl,
}: {
  accessToken: string;
  owner: string;
  repo: string;
  webhookSecret: string;
  webhookUrl: string;
}) {
  const existingWebhook = await findExistingGitHubWebhook({
    accessToken,
    owner,
    repo,
    webhookUrl,
  });

  if (!existingWebhook.ok) {
    return existingWebhook;
  }

  if (existingWebhook.hookId !== null) {
    return {
      hookId: existingWebhook.hookId,
      ok: true as const,
    };
  }

  const response = await githubFetch({
    accessToken,
    body: JSON.stringify({
      active: true,
      config: {
        content_type: "json",
        insecure_ssl: "0",
        secret: webhookSecret,
        url: webhookUrl,
      },
      events: ["push"],
      name: "web",
    }),
    method: "POST",
    owner,
    path: "hooks",
    repo,
  });

  const data = (await response.json().catch(() => null)) as {
    id?: unknown;
    message?: unknown;
  } | null;

  if (!response.ok) {
    return {
      message: getGitHubErrorMessage(response.status, data?.message),
      ok: false as const,
      status: response.status === 404 ? 404 : 502,
    };
  }

  return {
    hookId: typeof data?.id === "number" ? data.id : null,
    ok: true as const,
  };
}

async function findExistingGitHubWebhook({
  accessToken,
  owner,
  repo,
  webhookUrl,
}: {
  accessToken: string;
  owner: string;
  repo: string;
  webhookUrl: string;
}) {
  const response = await githubFetch({
    accessToken,
    method: "GET",
    owner,
    path: "hooks",
    repo,
  });

  const data = (await response.json().catch(() => null)) as
    | GitHubWebhook[]
    | { message?: unknown }
    | null;

  if (!response.ok) {
    const message =
      data && !Array.isArray(data) ? data.message : "GitHub API 요청 실패";

    return {
      message: getGitHubErrorMessage(response.status, message),
      ok: false as const,
      status: response.status === 404 ? 404 : 502,
    };
  }

  if (!Array.isArray(data)) {
    return {
      message: "GitHub 웹훅 목록 응답 형식이 올바르지 않습니다.",
      ok: false as const,
      status: 502,
    };
  }

  const existingWebhook = data.find(
    (webhook) => webhook.config?.url === webhookUrl,
  );

  return {
    hookId: typeof existingWebhook?.id === "number" ? existingWebhook.id : null,
    ok: true as const,
  };
}

function githubFetch({
  accessToken,
  body,
  method,
  owner,
  path,
  repo,
}: {
  accessToken: string;
  body?: BodyInit;
  method: "GET" | "POST";
  owner: string;
  path: string;
  repo: string;
}) {
  return fetch(`https://api.github.com/repos/${owner}/${repo}/${path}`, {
    body,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    method,
  });
}

function getGitHubErrorMessage(status: number, message: unknown) {
  if (status === 401 || status === 403) {
    return "GitHub 웹훅을 생성할 권한이 없습니다. GitHub로 다시 로그인해주세요.";
  }

  if (status === 404) {
    return "GitHub Repository를 찾을 수 없습니다.";
  }

  if (status === 422) {
    return "GitHub 웹훅 요청이 유효하지 않습니다. 이미 등록된 웹훅인지 확인해주세요.";
  }

  if (typeof message === "string" && message) {
    return `GitHub 웹훅 생성에 실패했습니다: ${message}`;
  }

  return "GitHub 웹훅 생성에 실패했습니다.";
}
