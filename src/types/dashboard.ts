import type { PersonalScoreTier } from "@/features/score/types";
import type { ProblemPlatform } from "@/generated/prisma/enums";

export type DashboardPersonalTier = {
  nextTierScore: number;
  progress: number;
  progressLabel: string;
  score: number;
  solvedCount: number;
  tier: PersonalScoreTier;
};

export type DashboardStatsSummary = {
  totalSolved: number;
  weeklyChangePercent: number;
  weeklySolved: number;
};

export type DashboardMasteryBucket = {
  fill: string;
  solved: number;
  tier: string;
};

export type DashboardPendingProblem = {
  id: string;
  platform: ProblemPlatform;
  problemId: string;
  submittedAtText: string;
  tier: string;
  title: string;
};

export type DashboardQuickLaunch = {
  platform: ProblemPlatform;
  problemCount: number;
};

export type DashboardPageData = {
  mastery: DashboardMasteryBucket[];
  pendingProblems: DashboardPendingProblem[];
  personalTier: DashboardPersonalTier;
  quickLaunches: DashboardQuickLaunch[];
  stats: DashboardStatsSummary;
};
