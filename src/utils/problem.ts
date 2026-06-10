import {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";

import type {
  PendingProblem,
  PlatformProblemCount,
  ProblemTierBucket,
} from "@/types/problem";

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

export function getProblemStatusLabel(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "Completed"
    : "Memo pending";
}

export function getProblemStatusDescription(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "Ready to share"
    : "Write a memo to share";
}

export function getProblemStatusBadgeClass(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "inline-flex items-center rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed"
    : "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-body-sm font-semibold text-amber-700";
}

export function formatAccuracy(accuracy: number | null) {
  return accuracy === null ? null : `${accuracy}%`;
}

export function formatScore(score: number | null, scoreMax: number | null) {
  if (score === null) {
    return null;
  }

  return scoreMax === null ? String(score) : `${score} / ${scoreMax}`;
}

export function getSubmittedLabel(submittedAtText: string | null) {
  return submittedAtText ?? "Submitted";
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(date);
}

export function getTierBadgeClass(tier: string | null) {
  if (tier?.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier?.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  return "badge-tier-silver";
}

export function normalizeProblemCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}

export function createProblemTierBuckets(
  rows: Array<{ tier: string | null }>,
): ProblemTierBucket[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const bucket = parseProblemTierBucket(row.tier);

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

export function createPendingProblem(row: {
  id: string;
  platform: ProblemPlatform;
  problemId: string;
  submittedAtText: string | null;
  tier: string | null;
  title: string;
}): PendingProblem {
  return {
    id: row.id,
    platform: row.platform,
    problemId: row.problemId,
    submittedAtText: row.submittedAtText ?? "-",
    tier: row.tier ?? "-",
    title: row.title,
  };
}

export function createPlatformProblemCounts(
  rows: Array<{
    _count: {
      _all: number;
    };
    platform: ProblemPlatform;
  }>,
): PlatformProblemCount[] {
  const counts = new Map(rows.map((row) => [row.platform, row._count._all]));

  return QUICK_LAUNCH_PLATFORMS.map((platform) => ({
    platform,
    problemCount: counts.get(platform) ?? 0,
  }));
}

function parseProblemTierBucket(tier: string | null) {
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
