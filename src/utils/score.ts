import type { ScoreTierThreshold } from "@/types/score";
import type { PersonalScoreTier } from "@/types/user";

export const personalScoreTierThresholds = [
  { minScore: 1_000_000, tier: "Diamond" },
  { minScore: 100_000, tier: "Platinum" },
  { minScore: 10_000, tier: "Gold" },
  { minScore: 1_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<ScoreTierThreshold<PersonalScoreTier>>;

export const studyScoreTierThresholds = [
  { minScore: 5_000_000, tier: "Diamond" },
  { minScore: 500_000, tier: "Platinum" },
  { minScore: 50_000, tier: "Gold" },
  { minScore: 5_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<ScoreTierThreshold>;

// 개인 점수에 해당하는 티어를 계산한다.
export function getPersonalTier(score: number): PersonalScoreTier {
  return (
    personalScoreTierThresholds.find(
      (threshold) => score >= threshold.minScore,
    )?.tier ?? "Bronze"
  );
}

// 스터디 점수에 해당하는 티어를 계산한다.
export function getStudyTier(score: number) {
  return (
    studyScoreTierThresholds.find((threshold) => score >= threshold.minScore)
      ?.tier ?? "Bronze"
  );
}

// 점수와 티어 기준표를 사용해 현재 티어를 결정한다.
export function getScoreTier<TTier extends string>(
  score: number,
  thresholds: ReadonlyArray<ScoreTierThreshold<TTier>>,
  fallbackTier: TTier,
): TTier {
  return (
    thresholds.find((threshold) => score >= threshold.minScore)?.tier ??
    fallbackTier
  );
}

// 현재 티어 구간에서 점수 진행률을 계산한다.
export function getScoreTierProgress<TTier extends string>(
  score: number,
  tier: TTier,
  thresholds: ReadonlyArray<ScoreTierThreshold<TTier>>,
) {
  const currentTierIndex = thresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const currentThreshold = thresholds[currentTierIndex];
  const nextThreshold = thresholds[currentTierIndex - 1];

  if (!currentThreshold || !nextThreshold) {
    return 100;
  }

  const currentTierScore = score - currentThreshold.minScore;
  const nextTierScore = nextThreshold.minScore - currentThreshold.minScore;

  return Math.max(0, Math.min((currentTierScore / nextTierScore) * 100, 100));
}

// 티어 진행 상황을 현재 점수와 목표 점수 문자열로 만든다.
export function getScoreProgressLabel<TTier extends string>(
  score: number,
  tier: TTier,
  thresholds: ReadonlyArray<ScoreTierThreshold<TTier>>,
) {
  const currentTierIndex = thresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const nextThreshold = thresholds[currentTierIndex - 1];

  if (!nextThreshold) {
    return "최고 티어";
  }

  return `${score.toLocaleString()} / ${nextThreshold.minScore.toLocaleString()} XP`;
}

// 현재 티어 다음 단계의 최소 점수를 반환한다.
export function getNextScoreTierScore<TTier extends string>(
  tier: TTier,
  thresholds: ReadonlyArray<ScoreTierThreshold<TTier>>,
) {
  const currentTierIndex = thresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const nextThreshold = thresholds[currentTierIndex - 1];

  return nextThreshold?.minScore ?? thresholds[0]?.minScore ?? 0;
}
