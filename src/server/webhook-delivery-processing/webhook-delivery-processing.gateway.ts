import "server-only";

import {
  isRetryableGitHubStatus,
  RetryableGitHubFileError,
} from "@/server/github/github.errors";
import { getGitHubProblemMetadataErrorMessage } from "@/server/webhook-delivery-processing/webhook-delivery-processing.mapper";
import {
  isGitHubFileContentResponse,
  type GitHubContentResponse,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.schema";
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
  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new RetryableGitHubFileError(
      "GitHub 코드 조회 요청에 실패했습니다.",
      {
        cause: error,
      },
    );
  }

  if (!response.ok) {
    if (isRetryableGitHubStatus(response.status)) {
      throw new RetryableGitHubFileError(
        `GitHub 코드 조회 실패: HTTP ${response.status}`,
      );
    }

    return null;
  }

  const contentLength = Number(response.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_CODE_SIZE_BYTES) {
    return null;
  }

  return readResponseTextWithSizeLimit(response, MAX_CODE_SIZE_BYTES);
}

// 특정 커밋의 문제 정보를 GitHub API에서 조회한다.
export async function fetchGitHubProblemMetadata({
  commitSha,
  path,
  repositoryFullName,
}: {
  commitSha: string;
  path: string;
  repositoryFullName: string;
}): Promise<GitHubProblemMetadata | null> {
  let response: Response;

  try {
    response = await fetch(
      `https://api.github.com/repos/${repositoryFullName}/contents/${encodeGitHubPath(path)}?ref=${encodeURIComponent(commitSha)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
      },
    );
  } catch (error) {
    throw new RetryableGitHubFileError(
      "GitHub 문제 정보 조회 요청에 실패했습니다.",
      {
        cause: error,
      },
    );
  }

  const data = (await response
    .json()
    .catch(() => null)) as GitHubContentResponse | null;

  if (!response.ok) {
    const message = getGitHubProblemMetadataErrorMessage(response.status, data);

    if (isRetryableGitHubStatus(response.status)) {
      throw new RetryableGitHubFileError(message);
    }

    return null;
  }

  if (!isGitHubFileContentResponse(data)) {
    return null;
  }

  if (data.size > MAX_PROBLEM_METADATA_SIZE_BYTES) {
    return null;
  }

  return {
    commitSha,
    path,
    text: Buffer.from(data.content.replace(/\s/g, ""), "base64").toString(
      "utf8",
    ),
  };
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
