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

// 사용자의 점수를 조회해 개인 티어 정보를 만든다.
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

// 점수를 기반으로 개인 티어 표시 데이터를 구성한다.
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

// 프로필 화면에 필요한 사용자 정보와 문제 수를 조회한다.
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

// 검색어와 제외 조건에 맞는 사용자 목록을 조회한다.
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

// 현재 사용자의 친구 목록을 사용자 요약 데이터로 조회한다.
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

// 사용자 조회 결과를 공용 사용자 요약 데이터로 변환한다.
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
