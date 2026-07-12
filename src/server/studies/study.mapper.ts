import "server-only";

import {
  getNextScoreTierScore,
  getScoreProgressLabel,
  studyScoreTierThresholds,
} from "@/utils/score";
import type { StudyTier } from "@/types/study";

// 스터디 티어 진행도를 점수 범위 문자열로 만든다.
export function getProgressLabel(score: number, tier: StudyTier) {
  return getScoreProgressLabel(score, tier, studyScoreTierThresholds);
}

// 스터디 티어의 다음 티어 진입 점수를 반환한다.
export function getNextTierScore(tier: StudyTier) {
  return getNextScoreTierScore(tier, studyScoreTierThresholds);
}

// 사용자 이름이 없을 때 사용할 표시 이름을 결정한다.
export function getUserDisplayName(name: string | null) {
  return name || "Unknown";
}

// 알 수 없는 카테고리 값을 문자열 배열로 정리한다.
export function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}
