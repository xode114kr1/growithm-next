import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
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

  const stats = await prisma.problemSubmission.aggregate({
    _count: {
      id: true,
    },
    _sum: {
      score: true,
    },
    where: {
      status: ProblemSubmissionStatus.COMPLETED,
      userId,
    },
  });

  return createDashboardPersonalTier(stats._sum.score ?? 0, stats._count.id);
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
