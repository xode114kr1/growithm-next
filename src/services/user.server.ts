import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  UserPersonalTier,
  UserProfilePageData,
  UserSummary,
} from "@/types/user";
import {
  getNextPersonalTierScore,
  getPersonalProgressLabel,
  getPersonalScoreTier,
  getPersonalTierProgress,
  getUserAvatar,
  getUserDisplayName,
  getUserTier,
} from "@/utils/user";

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

export async function getUserProfilePageData(
  userId: string,
): Promise<UserProfilePageData | null> {
  const user = await prisma.user.findUnique({
    select: {
      email: true,
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

  const tier = getUserTier(user.score);

  return {
    avatar: getUserAvatar(user.image),
    name: getUserDisplayName(user.name, user.email),
    score: user.score,
    solvedCount: user._count.problemSubmissions,
    tier: tier.tier,
    tierClass: tier.tierClass,
  };
}

export async function getUsers({
  excludedUserId,
}: {
  excludedUserId: string;
}): Promise<UserSummary[]> {
  const users = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
    select: userSummarySelect,
    where: {
      id: {
        not: excludedUserId,
      },
    },
  });

  return users.map(createUserSummary);
}

export async function getFriendUsers(
  userId: string | undefined,
): Promise<UserSummary[]> {
  if (!userId) {
    return [];
  }

  const friendships = await prisma.friendship.findMany({
    include: {
      userA: {
        select: userSummarySelect,
      },
      userB: {
        select: userSummarySelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });

  return friendships.map((friendship) =>
    createUserSummary(
      friendship.userAId === userId ? friendship.userB : friendship.userA,
    ),
  );
}

type UserSummaryRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};

const userSummarySelect = {
  email: true,
  id: true,
  image: true,
  name: true,
  score: true,
} satisfies Record<keyof UserSummaryRow, true>;

function createUserSummary(user: UserSummaryRow): UserSummary {
  const tier = getUserTier(user.score);

  return {
    avatar: getUserAvatar(user.image),
    id: user.id,
    name: getUserDisplayName(user.name, user.email),
    tier: tier.tier,
    tierClass: tier.tierClass,
  };
}
