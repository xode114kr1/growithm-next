import {
  getNextScoreTierScore,
  getScoreProgressLabel,
  getScoreTier,
} from "@/utils/score";
import type { StudyTier } from "@/types/study";

const studyScoreTierThresholds = [
  { minScore: 5_000_000, tier: "Diamond" },
  { minScore: 500_000, tier: "Platinum" },
  { minScore: 50_000, tier: "Gold" },
  { minScore: 5_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: StudyTier }>;

// 스터디 점수에 해당하는 티어를 계산한다.
export function getStudyTier(score: number): StudyTier {
  return getScoreTier(score, studyScoreTierThresholds, "Bronze");
}

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
