import type { PersonalScoreTier } from "@/features/score/types";

export const personalScoreTierThresholds = [
  { minScore: 1_000_000, tier: "Diamond" },
  { minScore: 100_000, tier: "Platinum" },
  { minScore: 10_000, tier: "Gold" },
  { minScore: 1_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: PersonalScoreTier }>;

export function getPersonalScoreTier(score: number): PersonalScoreTier {
  return (
    personalScoreTierThresholds.find((threshold) => score >= threshold.minScore)
      ?.tier ?? "Bronze"
  );
}

export function getPersonalTierProgress(
  score: number,
  tier: PersonalScoreTier,
) {
  const currentTierIndex = personalScoreTierThresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const currentThreshold = personalScoreTierThresholds[currentTierIndex];
  const nextThreshold = personalScoreTierThresholds[currentTierIndex - 1];

  if (!currentThreshold || !nextThreshold) {
    return 100;
  }

  const currentTierScore = score - currentThreshold.minScore;
  const nextTierScore = nextThreshold.minScore - currentThreshold.minScore;

  return Math.max(0, Math.min((currentTierScore / nextTierScore) * 100, 100));
}

export function getPersonalProgressLabel(
  score: number,
  tier: PersonalScoreTier,
) {
  const currentTierIndex = personalScoreTierThresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const nextThreshold = personalScoreTierThresholds[currentTierIndex - 1];

  if (!nextThreshold) {
    return "Max tier";
  }

  return `${score.toLocaleString()} / ${nextThreshold.minScore.toLocaleString()} XP`;
}

export function getNextPersonalTierScore(tier: PersonalScoreTier) {
  const currentTierIndex = personalScoreTierThresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const nextThreshold = personalScoreTierThresholds[currentTierIndex - 1];

  return nextThreshold?.minScore ?? personalScoreTierThresholds[0].minScore;
}
