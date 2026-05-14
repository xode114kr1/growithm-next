import {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { getDashboardPersonalTier } from "@/features/dashboard/server/dashboard-tier-data";
import type {
  DashboardMasteryBucket,
  DashboardPageData,
  DashboardPendingProblem,
  DashboardQuickLaunch,
} from "@/features/dashboard/types";

const MASTERY_BUCKETS = [
  { fill: "#c1c7cf", key: "BRONZE" },
  { fill: "#dde3eb", key: "SILVER" },
  { fill: "#f4bf3a", key: "GOLD" },
  { fill: "#a3cfcf", key: "PLATINUM" },
  { fill: "#00daf3", key: "DIAMOND" },
  { fill: "#ba1a1a", key: "RUBY" },
] as const;

const QUICK_LAUNCH_PLATFORMS = [
  ProblemPlatform.BAEKJOON,
  ProblemPlatform.PROGRAMMERS,
] as const;

const PENDING_PROBLEM_LIMIT = 3;

export async function getDashboardPageData(
  userId: string | undefined,
): Promise<DashboardPageData> {
  const personalTier = getDashboardPersonalTier(userId);

  if (!userId) {
    return {
      mastery: createMasteryBuckets([]),
      pendingProblems: [],
      personalTier: await personalTier,
      quickLaunches: createQuickLaunches([]),
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
    mastery: createMasteryBuckets(tierRows),
    pendingProblems: pendingRows.map(createPendingProblem),
    personalTier: resolvedPersonalTier,
    quickLaunches: createQuickLaunches(platformRows),
    stats: {
      totalSolved,
      weeklyChangePercent: getWeeklyChangePercent({
        currentCount: weeklySolved,
        previousCount: previousWeeklySolved,
      }),
      weeklySolved,
    },
  };
}

function createMasteryBuckets(
  rows: Array<{ tier: string | null }>,
): DashboardMasteryBucket[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const bucket = parseTierBucket(row.tier);

    if (bucket) {
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
    }
  }

  return MASTERY_BUCKETS.map((bucket) => ({
    fill: bucket.fill,
    solved: counts.get(bucket.key) ?? 0,
    tier: bucket.key,
  }));
}

function createPendingProblem(row: {
  id: string;
  platform: ProblemPlatform;
  problemId: string;
  submittedAtText: string | null;
  tier: string | null;
  title: string;
}): DashboardPendingProblem {
  return {
    id: row.id,
    platform: row.platform,
    problemId: row.problemId,
    submittedAtText: row.submittedAtText ?? "-",
    tier: row.tier ?? "-",
    title: row.title,
  };
}

function createQuickLaunches(
  rows: Array<{
    _count: {
      _all: number;
    };
    platform: ProblemPlatform;
  }>,
): DashboardQuickLaunch[] {
  const counts = new Map(rows.map((row) => [row.platform, row._count._all]));

  return QUICK_LAUNCH_PLATFORMS.map((platform) => ({
    platform,
    problemCount: counts.get(platform) ?? 0,
  }));
}

function parseTierBucket(tier: string | null) {
  return tier?.split(/\s+/)[0]?.toUpperCase() ?? null;
}

function getDaysAgo(baseDate: Date, days: number) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() - days);
  return date;
}

function getWeeklyChangePercent({
  currentCount,
  previousCount,
}: {
  currentCount: number;
  previousCount: number;
}) {
  if (previousCount === 0) {
    return currentCount > 0 ? 100 : 0;
  }

  return Math.round(((currentCount - previousCount) / previousCount) * 100);
}
