import "server-only";

import {
  getFriendAvatar,
  getFriendDisplayName,
  getFriendTier,
} from "@/features/friend/utils";
import { prisma } from "@/lib/prisma";

export type FriendProfilePageData = {
  avatar: string;
  name: string;
  score: number;
  solvedCount: number;
  tier: string;
  tierClass: string;
};

export async function getFriendProfilePageData(
  userId: string,
): Promise<FriendProfilePageData | null> {
  const user = await prisma.user.findUnique({
    select: {
      email: true,
      id: true,
      image: true,
      name: true,
      score: true,
      _count: {
        select: {
          problemSubmissions: true,
        },
      },
    },
    where: {
      id: userId,
    },
  });

  if (!user) {
    return null;
  }

  const tier = getFriendTier(user.score);

  return {
    avatar: getFriendAvatar(user.image),
    name: getFriendDisplayName(user.name, user.email),
    score: user.score,
    solvedCount: user._count.problemSubmissions,
    tier: tier.tier,
    tierClass: tier.tierClass,
  };
}
