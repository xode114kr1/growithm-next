import type { GitHubContentResponse } from "@/services/readme/readme.validator";

// GitHub API 요청에 사용할 파일 경로의 각 구간을 인코딩한다.
export function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

// GitHub 파일 조회 실패 응답을 사용자용 오류 메시지로 변환한다.
export function getGitHubContentErrorMessage(
  status: number,
  data: GitHubContentResponse | null,
) {
  if (typeof data?.message === "string" && data.message) {
    return `GitHub README 조회 실패: ${data.message}`;
  }

  return `GitHub README 조회 실패: HTTP ${status}`;
}
