import "server-only";

type GitHubWebhook = {
  config?: {
    url?: unknown;
  };
  id?: unknown;
};

// 저장소에 기존 웹훅이 없으면 새 GitHub 웹훅을 생성한다.
export async function createGitHubWebhook({
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

  if (!existingWebhook.ok) return existingWebhook;

  if (existingWebhook.hookId !== null) {
    return { hookId: existingWebhook.hookId, ok: true as const };
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

// 저장소에 동일한 수신 URL의 GitHub 웹훅이 있는지 확인한다.
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

// GitHub 저장소 웹훅 API 요청을 공통 헤더와 함께 전송한다.
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

// GitHub 웹훅 API 오류를 사용자용 메시지로 변환한다.
function getGitHubErrorMessage(status: number, message: unknown) {
  if (status === 401 || status === 403) {
    return "GitHub 웹훅을 생성할 권한이 없습니다. GitHub로 다시 로그인해주세요.";
  }

  if (status === 404) return "GitHub Repository를 찾을 수 없습니다.";

  if (status === 422) {
    return "GitHub 웹훅 요청이 유효하지 않습니다. 이미 등록된 웹훅인지 확인해주세요.";
  }

  if (typeof message === "string" && message) {
    return `GitHub 웹훅 생성에 실패했습니다: ${message}`;
  }

  return "GitHub 웹훅 생성에 실패했습니다.";
}
