import type {
  PersonalScoreTier,
  ScoreTierThreshold,
} from "@/features/score/types";

export const personalScoreTierThresholds = [
  { minScore: 1_000_000, tier: "Diamond" },
  { minScore: 100_000, tier: "Platinum" },
  { minScore: 10_000, tier: "Gold" },
  { minScore: 1_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: PersonalScoreTier }>;

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
    return "Max tier";
  }

  return `${score.toLocaleString()} / ${nextThreshold.minScore.toLocaleString()} XP`;
}

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

export function getPersonalScoreTier(score: number): PersonalScoreTier {
  return getScoreTier(score, personalScoreTierThresholds, "Bronze");
}

export function getPersonalTierProgress(
  score: number,
  tier: PersonalScoreTier,
) {
  return getScoreTierProgress(score, tier, personalScoreTierThresholds);
}

export function getPersonalProgressLabel(
  score: number,
  tier: PersonalScoreTier,
) {
  return getScoreProgressLabel(score, tier, personalScoreTierThresholds);
}

export function getNextPersonalTierScore(tier: PersonalScoreTier) {
  return getNextScoreTierScore(tier, personalScoreTierThresholds);
}
