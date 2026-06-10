import type { PersonalScoreTier } from "@/types/user";

import {
  getNextScoreTierScore,
  getScoreProgressLabel,
  getScoreTier,
  getScoreTierProgress,
} from "@/utils/score";

const personalScoreTierThresholds = [
  { minScore: 1_000_000, tier: "Diamond" },
  { minScore: 100_000, tier: "Platinum" },
  { minScore: 10_000, tier: "Gold" },
  { minScore: 1_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: PersonalScoreTier }>;

const tierClasses = {
  Bronze: "bg-orange-50 border-orange-200 text-orange-800",
  Diamond: "bg-cyan-50 border-cyan-200 text-cyan-800",
  Gold: "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-700",
  Platinum:
    "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
  Silver: "bg-slate-200 border-slate-300 text-slate-600",
};

export function getUserTier(score: number) {
  const tier = getPersonalScoreTier(score);

  return {
    tier: `${tier} Tier`,
    tierClass: tierClasses[tier],
  };
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

export function getUserDisplayName(name: string | null, email: string | null) {
  return name?.trim() || email?.trim() || "Unknown Developer";
}

export function getUserAvatar(image: string | null) {
  return image || "https://avatars.githubusercontent.com/u/0?v=4";
}
