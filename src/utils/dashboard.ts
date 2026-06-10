import { ProblemPlatform } from "@/generated/prisma/enums";

import type {
  DashboardMasteryBucket,
  DashboardPendingProblem,
  DashboardQuickLaunch,
} from "@/types/dashboard";

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

const PROGRAMMERS_LEVEL_BUCKETS: Record<number, string> = {
  1: "BRONZE",
  2: "SILVER",
  3: "GOLD",
  4: "PLATINUM",
  5: "DIAMOND",
};

export function createDashboardMasteryBuckets(
  rows: Array<{ tier: string | null }>,
): DashboardMasteryBucket[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const bucket = parseDashboardTierBucket(row.tier);

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

export function createDashboardPendingProblem(row: {
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

export function createDashboardQuickLaunches(
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

export function getDashboardWeeklyChangePercent({
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

function parseDashboardTierBucket(tier: string | null) {
  const normalizedTier = tier?.trim().toLowerCase() ?? "";

  if (!normalizedTier) {
    return null;
  }

  const levelMatch = normalizedTier.match(/(?:lv\.?|level)\s*(\d+)/);

  if (levelMatch) {
    return PROGRAMMERS_LEVEL_BUCKETS[Number(levelMatch[1])] ?? null;
  }

  return normalizedTier.split(/\s+/)[0]?.toUpperCase() ?? null;
}
