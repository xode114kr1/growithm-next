// GitHub 웹훅 API 오류를 사용자용 메시지로 변환한다.
export function getGitHubWebhookErrorMessage(status: number, message: unknown) {
  if (status === 401 || status === 403) {
    return "GitHub 웹훅을 생성할 권한이 없습니다. GitHub로 다시 로그인해주세요.";
  }

  if (status === 404) return "GitHub Repository를 찾을 수 없습니다.";

  if (status === 422) {
    return "GitHub 웹훅 요청이 유효하지 않습니다. 이미 등록된 웹훅인지 확인해주세요.";
  }

  if (typeof message === "string" && message) {
    return `GitHub 웹훅 생성에 실패했습니다: ${message}`;
  }

  return "GitHub 웹훅 생성에 실패했습니다.";
}
