import type { PersonalScoreTier } from "@/features/score/types";

export type DashboardPersonalTier = {
  nextTierScore: number;
  progress: number;
  progressLabel: string;
  score: number;
  solvedCount: number;
  tier: PersonalScoreTier;
};
