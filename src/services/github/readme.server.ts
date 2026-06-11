import "server-only";

import type { GitHubReadmeContent } from "@/types/github";
import {
  encodeGitHubPath,
  getGitHubContentErrorMessage,
  type GitHubContentResponse,
} from "@/services/github/readme.helper";

// 특정 커밋의 README 내용을 GitHub API에서 조회한다.
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
