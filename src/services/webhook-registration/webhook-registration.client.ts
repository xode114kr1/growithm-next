import "server-only";

import { getGitHubWebhookErrorMessage } from "@/services/webhook-registration/webhook-registration.helper";
import {
  getGitHubWebhookId,
  isGitHubWebhookList,
  type GitHubWebhookResponse,
} from "@/services/webhook-registration/webhook-registration.validator";

type GitHubWebhookClientError = {
  message: string;
  ok: false;
  status: number;
};

type GitHubWebhookSummary = {
  hookId: number | null;
  url: string | null;
};

// GitHub 저장소의 웹훅 목록을 조회한다.
export async function fetchGitHubWebhooks({
  accessToken,
  owner,
  repo,
}: {
  accessToken: string;
  owner: string;
  repo: string;
}) {
  const result = await githubFetch({
    accessToken,
    method: "GET",
    owner,
    path: "hooks",
    repo,
  });

  if (!result.ok) {
    return result;
  }

  if (!isGitHubWebhookList(result.data)) {
    return {
      message: "GitHub 웹훅 목록 응답 형식이 올바르지 않습니다.",
      ok: false as const,
      status: 502,
    };
  }

  return {
    ok: true as const,
    webhooks: result.data.map(createGitHubWebhookSummary),
  };
}

// GitHub 저장소에 push 웹훅을 생성한다.
export async function postGitHubWebhook({
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
  const result = await githubFetch({
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

  if (!result.ok) {
    return result;
  }

  if (Array.isArray(result.data)) {
    return {
      message: "GitHub 웹훅 생성 응답 형식이 올바르지 않습니다.",
      ok: false as const,
      status: 502,
    };
  }

  return { hookId: getGitHubWebhookId(result.data), ok: true as const };
}

// GitHub 저장소 API를 요청하고 응답과 오류를 서비스용 결과로 변환한다.
async function githubFetch({
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
}): Promise<
  | {
      data: GitHubWebhookResponse | GitHubWebhookResponse[] | null;
      ok: true;
    }
  | GitHubWebhookClientError
> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/${path}`,
      {
        body,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        method,
      },
    );
    const data = (await response.json().catch(() => null)) as
      | GitHubWebhookResponse
      | GitHubWebhookResponse[]
      | null;

    if (!response.ok) {
      const message = Array.isArray(data) ? undefined : data?.message;

      return {
        message: getGitHubWebhookErrorMessage(response.status, message),
        ok: false,
        status: response.status === 404 ? 404 : 502,
      };
    }

    return { data, ok: true };
  } catch {
    return {
      message: "GitHub 웹훅 API에 연결할 수 없습니다.",
      ok: false,
      status: 502,
    };
  }
}

// GitHub 웹훅 응답을 command에서 사용할 요약 데이터로 변환한다.
function createGitHubWebhookSummary(
  webhook: GitHubWebhookResponse,
): GitHubWebhookSummary {
  return {
    hookId: getGitHubWebhookId(webhook),
    url: typeof webhook.config?.url === "string" ? webhook.config.url : null,
  };
}
