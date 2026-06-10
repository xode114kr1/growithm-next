import {
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { getDashboardPersonalTier } from "@/services/dashboard/dashboard-tier.server";
import type { DashboardPageData } from "@/types/dashboard";
import {
  createDashboardMasteryBuckets,
  createDashboardPendingProblem,
  createDashboardQuickLaunches,
  getDashboardWeeklyChangePercent,
} from "@/utils/dashboard";

const PENDING_PROBLEM_LIMIT = 3;

export async function getDashboardPageData(
  userId: string | undefined,
): Promise<DashboardPageData> {
  const personalTier = getDashboardPersonalTier(userId);

  if (!userId) {
    return {
      mastery: createDashboardMasteryBuckets([]),
      pendingProblems: [],
      personalTier: await personalTier,
      quickLaunches: createDashboardQuickLaunches([]),
      stats: {
        totalSolved: 0,
        weeklyChangePercent: 0,
        weeklySolved: 0,
      },
    };
  }

  const now = new Date();
  const currentWeekStart = getDaysAgo(now, 7);
  const previousWeekStart = getDaysAgo(now, 14);
  const userWhere = { userId };

  const [
    resolvedPersonalTier,
    totalSolved,
    weeklySolved,
    previousWeeklySolved,
    tierRows,
    platformRows,
    pendingRows,
  ] = await Promise.all([
    personalTier,
    prisma.problemSubmission.count({
      where: userWhere,
    }),
    prisma.problemSubmission.count({
      where: {
        ...userWhere,
        createdAt: {
          gte: currentWeekStart,
          lte: now,
        },
      },
    }),
    prisma.problemSubmission.count({
      where: {
        ...userWhere,
        createdAt: {
          gte: previousWeekStart,
          lt: currentWeekStart,
        },
      },
    }),
    prisma.problemSubmission.findMany({
      select: {
        tier: true,
      },
      where: userWhere,
    }),
    prisma.problemSubmission.groupBy({
      by: ["platform"],
      _count: {
        _all: true,
      },
      where: userWhere,
    }),
    prisma.problemSubmission.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      select: {
        id: true,
        platform: true,
        problemId: true,
        submittedAtText: true,
        tier: true,
        title: true,
      },
      take: PENDING_PROBLEM_LIMIT,
      where: {
        ...userWhere,
        status: ProblemSubmissionStatus.PENDING,
      },
    }),
  ]);

  return {
    mastery: createDashboardMasteryBuckets(tierRows),
    pendingProblems: pendingRows.map(createDashboardPendingProblem),
    personalTier: resolvedPersonalTier,
    quickLaunches: createDashboardQuickLaunches(platformRows),
    stats: {
      totalSolved,
      weeklyChangePercent: getDashboardWeeklyChangePercent({
        currentCount: weeklySolved,
        previousCount: previousWeeklySolved,
      }),
      weeklySolved,
    },
  };
}

function getDaysAgo(baseDate: Date, days: number) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() - days);
  return date;
}
