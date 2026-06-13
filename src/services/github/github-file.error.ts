export class RetryableGitHubFileError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RetryableGitHubFileError";
  }
}

export function isRetryableGitHubStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

export function isRetryableGitHubFileError(
  error: unknown,
): error is RetryableGitHubFileError {
  return error instanceof RetryableGitHubFileError;
}
