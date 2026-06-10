import type { PersonalScoreTier } from "@/features/score/types";

export type UserPersonalTier = {
  nextTierScore: number;
  progress: number;
  progressLabel: string;
  score: number;
  tier: PersonalScoreTier;
};
