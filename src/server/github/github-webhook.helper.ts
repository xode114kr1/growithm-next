import type { GitHubWebhookPayload } from "@/types/github";

// GitHub 웹훅 payload에서 저장소 전체 이름을 추출한다.
export function getRepositoryFullName(payload: GitHubWebhookPayload) {
  return typeof payload.repository?.full_name === "string"
    ? payload.repository.full_name
    : null;
}
