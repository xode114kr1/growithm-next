import "server-only";

import { prisma } from "@/lib/prisma";
import type { UserSummaryRow } from "@/server/users/user.helper";

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

// 검색어와 일치하는 사용자를 현재 사용자 제외 후 조회한다.
export async function findUsersByQuery({
  excludedUserId,
  limit,
  query,
}: {
  excludedUserId: string;
  limit: number;
  query: string;
}) {
  return prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
    select: userSummarySelect,
    take: limit,
    where: {
      id: {
        not: excludedUserId,
      },
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
  });
}

// 프로필 화면에 필요한 사용자 정보와 문제 수를 조회한다.
export async function findUserProfile(userId: string) {
  return prisma.user.findUnique({
    select: {
      _count: {
        select: {
          problemSubmissions: true,
        },
      },
      ...userSummarySelect,
    },
    where: {
      id: userId,
    },
  });
}
