export type PersonalScoreTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond";

export type UserPersonalTier = {
  nextTierScore: number;
  progress: number;
  progressLabel: string;
  score: number;
  tier: PersonalScoreTier;
};

export type UserSummary = {
  avatar: string;
  id: string;
  name: string;
  tier: PersonalScoreTier;
};

export type UserProfile = UserSummary & {
  score: number;
  solvedCount: number;
};
