import "server-only";

import { fetchGitHubContent } from "@/services/readme/readme.client";
import {
  isRetryableGitHubStatus,
  RetryableGitHubFileError,
} from "@/services/github/github-file.error";
import type { GitHubReadmeContent } from "@/types/github";
import {
  getGitHubContentErrorMessage,
} from "@/services/readme/readme.helper";
import {
  isGitHubFileContentResponse,
  type GitHubContentResponse,
} from "@/services/readme/readme.validator";

const MAX_README_SIZE_BYTES = 2 * 1024 * 1024;

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
  let response: Response;

  try {
    response = await fetchGitHubContent({
      accessToken,
      commitSha,
      path,
      repositoryFullName,
    });
  } catch (error) {
    throw new RetryableGitHubFileError("GitHub README 조회 요청에 실패했습니다.", {
      cause: error,
    });
  }

  const data = (await response.json().catch(() => null)) as
    | GitHubContentResponse
    | null;

  if (!response.ok) {
    const message = getGitHubContentErrorMessage(response.status, data);

    if (isRetryableGitHubStatus(response.status)) {
      throw new RetryableGitHubFileError(message);
    }

    throw new Error(message);
  }

  if (!isGitHubFileContentResponse(data)) {
    throw new Error("GitHub README 응답 형식이 올바르지 않습니다.");
  }

  if (data.size > MAX_README_SIZE_BYTES) {
    throw new Error("GitHub README 파일 크기가 2MB 제한을 초과했습니다.");
  }

  return {
    commitSha,
    path,
    text: Buffer.from(data.content.replace(/\s/g, ""), "base64").toString(
      "utf8",
    ),
  };
}
