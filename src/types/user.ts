import type { PersonalScoreTier } from "@/features/score/types";

export type UserPersonalTier = {
  nextTierScore: number;
  progress: number;
  progressLabel: string;
  score: number;
  tier: PersonalScoreTier;
};

export type UserProfilePageData = {
  avatar: string;
  name: string;
  score: number;
  solvedCount: number;
  tier: string;
  tierClass: string;
};

export type UserSummary = {
  avatar: string;
  id: string;
  name: string;
  tier: string;
  tierClass: string;
};
