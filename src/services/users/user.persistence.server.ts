import "server-only";

import { prisma } from "@/lib/prisma";
import type { UserSummaryRow } from "@/services/users/user.helper";

const userSummarySelect = {
  email: true,
  id: true,
  image: true,
  name: true,
  score: true,
} satisfies Record<keyof UserSummaryRow, true>;

// 사용자의 개인 티어 계산에 필요한 점수를 조회한다.
export async function findUserScore(userId: string) {
  return prisma.user.findUnique({
    select: {
      score: true,
    },
    where: {
      id: userId,
    },
  });
}

// 프로필 화면에 필요한 사용자 정보와 문제 제출 수를 조회한다.
export async function findUserProfile(userId: string) {
  return prisma.user.findUnique({
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
}

// 제외할 사용자를 뺀 사용자 요약 목록을 조회한다.
export async function findUsersExcluding(excludedUserId: string) {
  return prisma.user.findMany({
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
}

// 현재 사용자와 친구 관계인 사용자 정보를 조회한다.
export async function findFriendUsers(userId: string) {
  return prisma.friendship.findMany({
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
}
