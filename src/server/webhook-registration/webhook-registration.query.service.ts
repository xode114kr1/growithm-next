import "server-only";

import { findLatestGitHubRepositoryWebhook } from "@/server/webhook-registration/webhook-registration.repository";
import type { GitHubRepositoryWebhookSummary } from "@/types/github";

// 웹훅 가이드에서 표시할 사용자의 기존 GitHub 웹훅 정보를 조회한다.
export async function getLatestGitHubRepositoryWebhook(
  userId: string,
): Promise<GitHubRepositoryWebhookSummary | null> {
  return findLatestGitHubRepositoryWebhook(userId);
}
