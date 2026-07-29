import "server-only";

import {
  isRetryableGitHubStatus,
  RetryableGitHubFileError,
} from "@/server/github/github.errors";
import type { GitHubProblemMetadata } from "@/types/github";

const GITHUB_REQUEST_TIMEOUT_MS = 10_000;
const MAX_CODE_SIZE_BYTES = 1024 * 1024;
const MAX_PROBLEM_METADATA_SIZE_BYTES = 2 * 1024 * 1024;

// GitHub API 요청에 사용할 파일 경로의 각 구간을 인코딩한다.
function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

// 특정 커밋의 풀이 코드 파일을 GitHub에서 조회한다.
export async function fetchGitHubCodeContent({
  commitSha,
  path,
  repositoryFullName,
}: {
  commitSha: string;
  path: string | null;
  repositoryFullName: string;
}): Promise<string | null> {
  if (!path) {
    return null;
  }

  const url = `https://raw.githubusercontent.com/${repositoryFullName}/${commitSha}/${encodeGitHubPath(path)}`;

  return fetchGitHubRawContent({
    errorMessage: "GitHub 코드 조회",
    maxSizeBytes: MAX_CODE_SIZE_BYTES,
    url,
  });
}

// 특정 커밋의 문제 정보 파일을 GitHub에서 조회한다.
export async function fetchGitHubProblemMetadata({
  commitSha,
  path,
  repositoryFullName,
}: {
  commitSha: string;
  path: string;
  repositoryFullName: string;
}): Promise<GitHubProblemMetadata | null> {
  const url = `https://raw.githubusercontent.com/${repositoryFullName}/${commitSha}/${encodeGitHubPath(path)}`;
  const text = await fetchGitHubRawContent({
    errorMessage: "GitHub 문제 정보 조회",
    maxSizeBytes: MAX_PROBLEM_METADATA_SIZE_BYTES,
    url,
  });

  if (text === null) {
    return null;
  }

  return { commitSha, path, text };
}

// GitHub Raw URL에서 제한된 크기의 파일 내용을 조회한다.
async function fetchGitHubRawContent({
  errorMessage,
  maxSizeBytes,
  url,
}: {
  errorMessage: string;
  maxSizeBytes: number;
  url: string;
}) {
  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new RetryableGitHubFileError(`${errorMessage} 요청에 실패했습니다.`, {
      cause: error,
    });
  }

  if (!response.ok) {
    if (isRetryableGitHubStatus(response.status)) {
      throw new RetryableGitHubFileError(
        `${errorMessage} 실패: HTTP ${response.status}`,
      );
    }

    return null;
  }

  const contentLength = Number(response.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > maxSizeBytes) {
    return null;
  }

  return readResponseTextWithSizeLimit(response, maxSizeBytes);
}

// Content-Length가 없는 응답도 제한 크기까지만 읽는다.
async function readResponseTextWithSizeLimit(
  response: Response,
  maxSizeBytes: number,
): Promise<string | null> {
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
      return null;
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
