import type { ProblemPlatform } from "@/generated/prisma/enums";

export type ProblemTierBucket = {
  fill: string;
  solved: number;
  tier: string;
};

export type PendingProblem = {
  id: string;
  platform: ProblemPlatform;
  problemId: string;
  submittedAtText: string;
  tier: string;
  title: string;
};

export type PlatformProblemCount = {
  platform: ProblemPlatform;
  problemCount: number;
};
