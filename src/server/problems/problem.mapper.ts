import "server-only";

import { ProblemPlatform } from "@/generated/prisma/enums";
import type {
  PendingProblem,
  ProblemDetail,
  ProblemListItem,
  ProblemTierBucket,
} from "@/types/problem";

const MASTERY_BUCKETS = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "RUBY",
] as const;

const PROGRAMMERS_LEVEL_BUCKETS: Record<number, string> = {
  1: "BRONZE",
  2: "SILVER",
  3: "GOLD",
  4: "PLATINUM",
  5: "DIAMOND",
};

// 문제 목록 조회 결과를 화면 표시 데이터로 변환한다.
export function createProblemListItem(row: {
  categories: unknown;
  createdAt: Date;
  id: string;
  platform: ProblemPlatform;
  problemId: string;
  status: ProblemListItem["status"];
  submittedAtText: string | null;
  tier: string | null;
  title: string;
}): ProblemListItem {
  return {
    categories: normalizeProblemCategories(row.categories),
    code: `${row.platform}-${row.problemId}`,
    createdAt: row.createdAt,
    id: row.id,
    platform: row.platform,
    problemId: row.problemId,
    status: row.status,
    submittedAtText: row.submittedAtText,
    tier: row.tier,
    title: row.title,
  };
}

// 문제 상세 조회 결과를 화면 표시 데이터로 변환한다.
export function createProblemDetail(
  row: Omit<ProblemDetail, "categories"> & { categories: unknown },
): ProblemDetail {
  return {
    ...row,
    categories: normalizeProblemCategories(row.categories),
  };
}

// 문제 조회 결과를 대기 문제 표시 데이터로 변환한다.
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

// 문제 티어별 개수를 차트용 버킷 데이터로 집계한다.
export function createProblemTierBuckets(
  rows: Array<{ tier: string | null }>,
): ProblemTierBucket[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const bucket = parseProblemTierBucket(row.tier);

    if (bucket) counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }

  return MASTERY_BUCKETS.map((tier) => ({
    solved: counts.get(tier) ?? 0,
    tier,
  }));
}

// 문제 카테고리 값을 문자열 배열로 안전하게 정리한다.
function normalizeProblemCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) return [];

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}

// 문제 티어 문자열을 대시보드 집계 버킷으로 변환한다.
function parseProblemTierBucket(tier: string | null) {
  const normalizedTier = tier?.trim().toLowerCase() ?? "";

  if (!normalizedTier) return null;

  const levelMatch = normalizedTier.match(/(?:lv\.?|level)\s*(\d+)/);

  if (levelMatch) {
    return PROGRAMMERS_LEVEL_BUCKETS[Number(levelMatch[1])] ?? null;
  }

  return normalizedTier.split(/\s+/)[0]?.toUpperCase() ?? null;
}
