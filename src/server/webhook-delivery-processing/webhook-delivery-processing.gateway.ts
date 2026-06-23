import "server-only";

import {
  isRetryableGitHubStatus,
  RetryableGitHubFileError,
} from "@/server/github/github-file.error";
import {
  encodeGitHubPath,
  getGitHubContentErrorMessage,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.mapper";
import {
  isGitHubFileContentResponse,
  type GitHubContentResponse,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.schema";
import type { GitHubReadmeContent } from "@/types/github";

const GITHUB_REQUEST_TIMEOUT_MS = 10_000;
const MAX_CODE_SIZE_BYTES = 1024 * 1024;
const MAX_README_SIZE_BYTES = 2 * 1024 * 1024;

// GitHub raw content URL에서 풀이 코드 파일을 조회한다.
export async function fetchGitHubRawCode(url: string) {
  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new RetryableGitHubFileError("GitHub 코드 조회 요청에 실패했습니다.", {
      cause: error,
    });
  }

  if (!response.ok) {
    if (isRetryableGitHubStatus(response.status)) {
      throw new RetryableGitHubFileError(
        `GitHub 코드 조회 실패: HTTP ${response.status}`,
      );
    }

    return { code: null, status: response.status };
  }

  const contentLength = Number(response.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_CODE_SIZE_BYTES) {
    throw new Error("GitHub 코드 파일 크기가 1MB 제한을 초과했습니다.");
  }

  return {
    code: await readResponseTextWithSizeLimit(response, MAX_CODE_SIZE_BYTES),
    status: response.status,
  };
}

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

// GitHub Contents API에서 특정 커밋의 파일 응답을 조회한다.
async function fetchGitHubContent({
  accessToken,
  commitSha,
  path,
  repositoryFullName,
}: {
  accessToken: string;
  commitSha: string;
  path: string;
  repositoryFullName: string;
}) {
  return fetch(
    `https://api.github.com/repos/${repositoryFullName}/contents/${encodeGitHubPath(path)}?ref=${encodeURIComponent(commitSha)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
    },
  );
}

// Content-Length가 없는 응답도 제한 크기까지만 읽는다.
async function readResponseTextWithSizeLimit(
  response: Response,
  maxSizeBytes: number,
) {
  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    size += value.byteLength;

    if (size > maxSizeBytes) {
      await reader.cancel();
      throw new Error("GitHub 코드 파일 크기가 1MB 제한을 초과했습니다.");
    }

    chunks.push(value);
  }

  const content = new Uint8Array(size);
  let offset = 0;

  for (const chunk of chunks) {
    content.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(content);
}
