import "server-only";

import {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";
import {
  countProblems,
  countProblemsByUserId,
  createProblemShares,
  findAuthorizedStudyIds,
  findAvailableProblemTiers,
  findExistingSharedStudyIds,
  findOwnedProblemForSharing,
  findPendingProblemsByUserId,
  findProblemDetail,
  findProblems,
  findProblemTiersByUserId,
  updateProblemMemoRecord,
} from "@/server/problems/problem.repository";
import {
  createPendingProblem,
  createProblemTierBuckets,
  createProblemDetail,
  createProblemListItem,
} from "@/server/problems/problem.mapper";
import type {
  PendingProblem,
  ProblemDetail,
  ProblemFiltersState,
  ProblemListItem,
  ProblemShareResult,
  ProblemTierBucket,
} from "@/types/problem";

export const PROBLEM_PAGE_SIZE = 25;
const PENDING_PROBLEM_LIMIT = 3;

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

// 필터와 페이지 조건에 맞는 문제 목록을 화면용 데이터로 조회한다.
export async function getProblems({
  filters,
  page,
  userId,
}: {
  filters: ProblemFiltersState;
  page: number;
  userId: string | undefined;
}): Promise<ProblemListItem[]> {
  if (!userId) return [];

  const rows = await findProblems({
    filters,
    page,
    pageSize: PROBLEM_PAGE_SIZE,
    userId,
  });

  return rows.map(createProblemListItem);
}

// 사용자의 필터 조건에 해당하는 문제 수를 조회한다.
export async function getProblemCount(
  userId: string | undefined,
  filters?: ProblemFiltersState,
) {
  return userId ? countProblems({ filters, userId }) : 0;
}

// 사용자의 문제 필터에 사용할 고유 티어 목록을 조회한다.
export async function getAvailableProblemTiers(userId: string | undefined) {
  if (!userId) return [];

  const tiers = await findAvailableProblemTiers(userId);

  return tiers.flatMap((item) => item.tier ?? []);
}

// 사용자가 소유한 문제의 상세 화면 정보를 조회한다.
export async function getProblemDetail({
  id,
  userId,
}: {
  id: string;
  userId: string | undefined;
}): Promise<ProblemDetail | null> {
  if (!userId) return null;

  const problem = await findProblemDetail({ id, userId });

  return problem ? createProblemDetail(problem) : null;
}

// 사용자의 문제 제출을 티어별 분포 데이터로 조회한다.
export async function getProblemTierDistribution(
  userId: string | undefined,
): Promise<ProblemTierBucket[]> {
  if (!userId) return createProblemTierBuckets([]);

  return createProblemTierBuckets(await findProblemTiersByUserId(userId));
}

// 메모 작성이 필요한 사용자의 최근 대기 문제를 조회한다.
export async function getPendingProblems(
  userId: string | undefined,
): Promise<PendingProblem[]> {
  if (!userId) return [];

  const rows = await findPendingProblemsByUserId({
    limit: PENDING_PROBLEM_LIMIT,
    userId,
  });

  return rows.map(createPendingProblem);
}

// 사용자의 전체 문제 제출 수를 조회한다.
export async function getSolvedProblemCount(userId: string | undefined) {
  return userId ? countProblemsByUserId(userId) : 0;
}

// 사용자가 소유한 문제 제출의 메모와 상태를 수정한다.
export async function updateProblemMemo({
  memo,
  problemId,
  userId,
}: {
  memo: string;
  problemId: string;
  userId: string;
}) {
  return updateProblemMemoRecord({ memo, problemId, userId });
}

// 완료한 문제를 권한이 있는 스터디에 공유하고 점수를 반영한다.
export async function shareProblemWithStudies({
  problemId,
  studyIds,
  userId,
}: {
  problemId: string;
  studyIds: string[];
  userId: string;
}): Promise<ProblemShareResult> {
  const problem = await findOwnedProblemForSharing({ problemId, userId });

  if (!problem) {
    return createProblemShareError("공유할 수 있는 문제를 찾을 수 없습니다.");
  }

  if (problem.status !== ProblemSubmissionStatus.COMPLETED) {
    return createProblemShareError(
      "메모 작성이 완료된 문제만 공유할 수 있습니다.",
    );
  }

  const authorizedStudyIds = await findAuthorizedStudyIds({ studyIds, userId });

  if (authorizedStudyIds.length === 0) {
    return createProblemShareError("공유할 수 있는 스터디를 찾을 수 없습니다.");
  }

  const existingStudyIds = new Set(
    await findExistingSharedStudyIds({
      problemId: problem.id,
      studyIds: authorizedStudyIds,
    }),
  );
  const newStudyIds = authorizedStudyIds.filter(
    (studyId) => !existingStudyIds.has(studyId),
  );
  const skippedCount = studyIds.length - newStudyIds.length;

  if (newStudyIds.length > 0) {
    const shareScore = isWithinShareScoreWindow(problem.submittedAtText)
      ? getProblemShareScore(problem.tier)
      : 0;

    await createProblemShares({
      problemId: problem.id,
      shareScore,
      studyIds: newStudyIds,
      userId,
    });
  }

  return { error: null, newStudyIds, skippedCount };
}

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

// 문제 공유 실패 결과를 일관된 형태로 생성한다.
function createProblemShareError(error: string): ProblemShareResult {
  return { error, newStudyIds: [], skippedCount: 0 };
}

// 문제 티어에 해당하는 스터디 공유 점수를 계산한다.
function getProblemShareScore(tier: string | null) {
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
function isWithinShareScoreWindow(submittedAtText: string | null) {
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
