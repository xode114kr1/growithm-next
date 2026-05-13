import {
  getNextPersonalTierScore,
  getPersonalProgressLabel,
  getPersonalScoreTier,
  getPersonalTierProgress,
} from "@/features/score/utils";
import { prisma } from "@/lib/prisma";

import type { DashboardPersonalTier } from "@/features/dashboard/types";

export async function getDashboardPersonalTier(
  userId: string | undefined,
): Promise<DashboardPersonalTier> {
  if (!userId) {
    return createDashboardPersonalTier(0, 0);
  }

  const [user, solvedCount] = await Promise.all([
    prisma.user.findUnique({
      select: {
        score: true,
      },
      where: {
        id: userId,
      },
    }),
    prisma.problemSubmission.count({
      where: {
        userId,
      },
    }),
  ]);

  return createDashboardPersonalTier(user?.score ?? 0, solvedCount);
}

function createDashboardPersonalTier(
  score: number,
  solvedCount: number,
): DashboardPersonalTier {
  const tier = getPersonalScoreTier(score);

  return {
    nextTierScore: getNextPersonalTierScore(tier),
    progress: getPersonalTierProgress(score, tier),
    progressLabel: getPersonalProgressLabel(score, tier),
    score,
    solvedCount,
    tier,
  };
}
