import "server-only";

// GitHub 저장소의 웹훅 목록을 조회한다.
export function fetchGitHubWebhooks({
  accessToken,
  owner,
  repo,
}: {
  accessToken: string;
  owner: string;
  repo: string;
}) {
  return githubFetch({ accessToken, method: "GET", owner, path: "hooks", repo });
}

// GitHub 저장소에 push 웹훅을 생성한다.
export function postGitHubWebhook({
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
  return githubFetch({
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
}

// GitHub 저장소 API 요청을 공통 헤더와 함께 전송한다.
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
