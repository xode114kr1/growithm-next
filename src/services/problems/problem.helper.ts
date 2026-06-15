import type { Prisma } from "@/generated/prisma/client";
import { ProblemPlatform } from "@/generated/prisma/enums";
import type {
  PendingProblem,
  PlatformProblemCount,
  ProblemFiltersState,
  ProblemShareResult,
  ProblemSort,
  ProblemTierBucket,
} from "@/types/problem";

const MASTERY_BUCKETS = [
  { fill: "#a5663f", key: "BRONZE" },
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

const baekjoonBaseScores: Record<string, number> = {
  bronze: 1,
  diamond: 6_250_000,
  gold: 2_500,
  platinum: 125_000,
  silver: 50,
};

const baekjoonTierMultipliers: Record<string, number> = {
  i: 5,
  ii: 4,
  iii: 3,
  iv: 2,
  v: 1,
};

const programmersLevelScores: Record<number, number> = {
  1: 3,
  2: 150,
  3: 7_500,
  4: 375_000,
  5: 18_750_000,
};

// 플랫폼과 티어를 기준으로 문제 경험치 점수를 계산한다.
export function getProblemExperienceScore({
  platform,
  tier,
}: {
  platform: ProblemPlatform;
  tier: string | null | undefined;
}) {
  if (!tier) return 0;

  if (platform === ProblemPlatform.BAEKJOON) {
    return getBaekjoonExperienceScore(tier);
  }

  if (platform === ProblemPlatform.PROGRAMMERS) {
    return getProgrammersExperienceScore(tier);
  }

  return 0;
}

// 문제 카테고리 값을 문자열 배열로 안전하게 정리한다.
export function normalizeProblemCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) return [];

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
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

  return MASTERY_BUCKETS.map((bucket) => ({
    fill: bucket.fill,
    solved: counts.get(bucket.key) ?? 0,
    tier: bucket.key,
  }));
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

// 플랫폼별 문제 집계 결과를 지원 플랫폼 순서로 정리한다.
export function createPlatformProblemCounts(
  rows: Array<{
    _count: { _all: number };
    platform: ProblemPlatform;
  }>,
): PlatformProblemCount[] {
  const counts = new Map(rows.map((row) => [row.platform, row._count._all]));

  return QUICK_LAUNCH_PLATFORMS.map((platform) => ({
    platform,
    problemCount: counts.get(platform) ?? 0,
  }));
}

// 문제 목록 필터를 Prisma 조회 조건으로 변환한다.
export function buildProblemWhere(filters: ProblemFiltersState) {
  const where: Prisma.ProblemSubmissionWhereInput = {};

  if (filters.platform) where.platform = filters.platform;
  if (filters.tier) where.tier = filters.tier;

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { problemId: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

// 선택한 문제 정렬 기준을 Prisma 정렬 조건으로 변환한다.
export function buildProblemOrderBy(sort: ProblemSort) {
  const orderBy: Prisma.ProblemSubmissionOrderByWithRelationInput[] = [];

  if (sort === "oldest") orderBy.push({ createdAt: "asc" });
  else if (sort === "title") orderBy.push({ title: "asc" });
  else if (sort === "platform") orderBy.push({ platform: "asc" });
  else orderBy.push({ createdAt: "desc" });

  orderBy.push({ id: "asc" });

  return orderBy;
}

// 문제 공유 실패 결과를 일관된 형태로 생성한다.
export function createProblemShareError(error: string): ProblemShareResult {
  return { error, newStudyIds: [], skippedCount: 0 };
}

// 문제 티어에 해당하는 스터디 공유 점수를 계산한다.
export function getProblemShareScore(tier: string | null) {
  const normalizedTier = tier?.toLowerCase() ?? "";

  if (normalizedTier.includes("ruby")) return 60;
  if (normalizedTier.includes("diamond")) return 50;
  if (normalizedTier.includes("platinum")) return 40;
  if (normalizedTier.includes("gold")) return 30;
  if (normalizedTier.includes("silver")) return 20;
  if (normalizedTier.includes("bronze")) return 10;

  const levelMatch = normalizedTier.match(/(?:lv\.?|level)\s*(\d+)/);

  return levelMatch ? Math.max(0, Number(levelMatch[1]) * 10) : 0;
}

// 문제 제출 시각이 공유 점수 인정 기간 안인지 확인한다.
export function isWithinShareScoreWindow(submittedAtText: string | null) {
  const submittedAt = parseSubmittedAt(submittedAtText);

  if (!submittedAt) return false;

  const elapsedMs = Date.now() - submittedAt.getTime();

  return elapsedMs >= 0 && elapsedMs <= 2 * 24 * 60 * 60 * 1000;
}

// 제출 시각 문자열을 Date 객체로 변환한다.
function parseSubmittedAt(submittedAtText: string | null) {
  if (!submittedAtText) return null;

  const trimmed = submittedAtText.trim();
  const numericParts = trimmed.match(/\d+/g);

  if (numericParts && numericParts.length >= 3) {
    return new Date(
      Number(numericParts[0]),
      Number(numericParts[1]) - 1,
      Number(numericParts[2]),
      Number(numericParts[3] ?? 0),
      Number(numericParts[4] ?? 0),
      Number(numericParts[5] ?? 0),
    );
  }

  const parsed = new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

// 백준 티어 문자열을 경험치 점수로 변환한다.
function getBaekjoonExperienceScore(tier: string) {
  const normalizedTier = tier.trim().toLowerCase();
  const tierMatch = normalizedTier.match(
    /(bronze|silver|gold|platinum|diamond)\s+(i{1,3}|iv|v)\b/,
  );

  if (!tierMatch) return 0;

  const baseScore = baekjoonBaseScores[tierMatch[1]];
  const multiplier = baekjoonTierMultipliers[tierMatch[2]];

  return baseScore && multiplier ? baseScore * multiplier : 0;
}

// 프로그래머스 레벨 문자열을 경험치 점수로 변환한다.
function getProgrammersExperienceScore(tier: string) {
  const levelMatch = tier.trim().toLowerCase().match(/(?:lv\.?|level)\s*(\d+)/);

  if (!levelMatch) return 0;

  return programmersLevelScores[Number(levelMatch[1])] ?? 0;
}
