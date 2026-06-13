import "server-only";

import {
  isRetryableGitHubStatus,
  RetryableGitHubFileError,
} from "@/services/github/github-file.error";

const GITHUB_REQUEST_TIMEOUT_MS = 10_000;
const MAX_CODE_SIZE_BYTES = 1024 * 1024;

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
