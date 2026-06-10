import "server-only";

import {
  getNextPersonalTierScore,
  getPersonalProgressLabel,
  getPersonalScoreTier,
  getPersonalTierProgress,
} from "@/features/score/utils";
import { prisma } from "@/lib/prisma";
import type { UserPersonalTier } from "@/types/user";

export async function getUserPersonalTier(
  userId: string | undefined,
): Promise<UserPersonalTier> {
  if (!userId) {
    return createPersonalTier(0);
  }

  const user = await prisma.user.findUnique({
    select: {
      score: true,
    },
    where: {
      id: userId,
    },
  });

  return createPersonalTier(user?.score ?? 0);
}

function createPersonalTier(score: number): UserPersonalTier {
  const tier = getPersonalScoreTier(score);

  return {
    nextTierScore: getNextPersonalTierScore(tier),
    progress: getPersonalTierProgress(score, tier),
    progressLabel: getPersonalProgressLabel(score, tier),
    score,
    tier,
  };
}
