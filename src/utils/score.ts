import type { ScoreTierThreshold } from "@/types/score";

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
