// 재시도 가능한 GitHub 파일 조회 실패를 나타낸다.
export class RetryableGitHubFileError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RetryableGitHubFileError";
  }
}

// GitHub 파일 조회 응답 상태가 일시적인 실패인지 확인한다.
export function isRetryableGitHubStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}
