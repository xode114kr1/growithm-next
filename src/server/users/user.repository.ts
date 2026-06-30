import "server-only";

import { prisma } from "@/lib/prisma";
import type { UserSummaryRow } from "@/server/users/user.mapper";

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
  const todayRange = getTodayRange();

  const [user, todaySolvedCount] = await Promise.all([
    prisma.user.findUnique({
      select: {
        _count: {
          select: {
            problemSubmissions: true,
          },
        },
        accounts: {
          select: {
            providerAccountId: true,
          },
          take: 1,
          where: {
            provider: "github",
          },
        },
        problemSubmissions: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            createdAt: true,
            submittedAtText: true,
          },
          take: 1,
        },
        ...userSummarySelect,
      },
      where: {
        id: userId,
      },
    }),
    prisma.problemSubmission.count({
      where: {
        createdAt: {
          gte: todayRange.start,
          lt: todayRange.end,
        },
        userId,
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  return {
    ...user,
    todaySolvedCount,
  };
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { end, start };
}
