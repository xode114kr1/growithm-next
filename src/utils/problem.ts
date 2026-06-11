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
  if (!tier) {
    return 0;
  }

  if (platform === ProblemPlatform.BAEKJOON) {
    return getBaekjoonExperienceScore(tier);
  }

  if (platform === ProblemPlatform.PROGRAMMERS) {
    return getProgrammersExperienceScore(tier);
  }

  return 0;
}

// 문제 제출 상태의 표시 이름을 반환한다.
export function getProblemStatusLabel(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "Completed"
    : "Memo pending";
}

// 문제 제출 상태의 보조 설명 문구를 반환한다.
export function getProblemStatusDescription(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "Ready to share"
    : "Write a memo to share";
}

// 문제 제출 상태에 맞는 배지 스타일 클래스를 반환한다.
export function getProblemStatusBadgeClass(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "inline-flex items-center rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed"
    : "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-body-sm font-semibold text-amber-700";
}

// 정확도 값을 화면 표시용 백분율 문자열로 변환한다.
export function formatAccuracy(accuracy: number | null) {
  return accuracy === null ? null : `${accuracy}%`;
}

// 점수와 최대 점수를 화면 표시용 문자열로 변환한다.
export function formatScore(score: number | null, scoreMax: number | null) {
  if (score === null) {
    return null;
  }

  return scoreMax === null ? String(score) : `${score} / ${scoreMax}`;
}

// 제출 시각이 없을 때 기본 문구를 적용해 표시값을 만든다.
export function getSubmittedLabel(submittedAtText: string | null) {
  return submittedAtText ?? "Submitted";
}

// 문제 티어에 맞는 배지 스타일 클래스를 반환한다.
export function getTierBadgeClass(tier: string | null) {
  if (tier?.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier?.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  return "badge-tier-silver";
}

// 문제 카테고리 값을 문자열 배열로 안전하게 정리한다.
export function normalizeProblemCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

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

// 문제 티어 문자열을 대시보드 집계 버킷으로 변환한다.
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

// 백준 티어 문자열을 경험치 점수로 변환한다.
function getBaekjoonExperienceScore(tier: string) {
  const normalizedTier = tier.trim().toLowerCase();
  const tierMatch = normalizedTier.match(
    /(bronze|silver|gold|platinum|diamond)\s+(i{1,3}|iv|v)\b/,
  );

  if (!tierMatch) {
    return 0;
  }

  const baseScore = baekjoonBaseScores[tierMatch[1]];
  const multiplier = baekjoonTierMultipliers[tierMatch[2]];

  return baseScore && multiplier ? baseScore * multiplier : 0;
}

// 프로그래머스 레벨 문자열을 경험치 점수로 변환한다.
function getProgrammersExperienceScore(tier: string) {
  const levelMatch = tier.trim().toLowerCase().match(/(?:lv\.?|level)\s*(\d+)/);

  if (!levelMatch) {
    return 0;
  }

  return programmersLevelScores[Number(levelMatch[1])] ?? 0;
}
