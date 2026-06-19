import type { StudyTier } from "@/types/study";
import { getScoreTierProgress } from "@/utils/score";

const studyScoreTierThresholds = [
  { minScore: 5_000_000, tier: "Diamond" },
  { minScore: 500_000, tier: "Platinum" },
  { minScore: 50_000, tier: "Gold" },
  { minScore: 5_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: StudyTier }>;

// 스터디 점수의 현재 티어 내 진행률을 계산한다.
export function getTierProgress(score: number, tier: StudyTier) {
  return getScoreTierProgress(score, tier, studyScoreTierThresholds);
}
