import "server-only";

import type { GitHubReadmeContent } from "@/types/github";

type GitHubContentResponse = {
  content?: unknown;
  encoding?: unknown;
  message?: unknown;
  type?: unknown;
};

export async function fetchGitHubReadmeContent({
  accessToken,
  commitSha,
  path,
  repositoryFullName,
}: {
  accessToken: string;
  commitSha: string;
  path: string;
  repositoryFullName: string;
}): Promise<GitHubReadmeContent> {
  const response = await fetch(
    `https://api.github.com/repos/${repositoryFullName}/contents/${encodeGitHubPath(path)}?ref=${encodeURIComponent(commitSha)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const data = (await response.json().catch(() => null)) as
    | GitHubContentResponse
    | null;

  if (!response.ok) {
    throw new Error(getGitHubContentErrorMessage(response.status, data));
  }

  if (
    data?.type !== "file" ||
    data.encoding !== "base64" ||
    typeof data.content !== "string"
  ) {
    throw new Error("GitHub README 응답 형식이 올바르지 않습니다.");
  }

  return {
    commitSha,
    path,
    text: Buffer.from(data.content.replace(/\s/g, ""), "base64").toString(
      "utf8",
    ),
  };
}

function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function getGitHubContentErrorMessage(
  status: number,
  data: GitHubContentResponse | null,
) {
  if (typeof data?.message === "string" && data.message) {
    return `GitHub README 조회 실패: ${data.message}`;
  }

  return `GitHub README 조회 실패: HTTP ${status}`;
}
