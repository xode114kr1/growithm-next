import "server-only";

import {
  countProblems,
  countProblemsByPlatform,
  countProblemsByUserId,
  findAvailableProblemTiers,
  findPendingProblemsByUserId,
  findProblemDetail,
  findProblems,
  findProblemTiersByUserId,
} from "@/services/problems/problem.persistence.server";
import {
  createPendingProblem,
  createPlatformProblemCounts,
  createProblemTierBuckets,
  normalizeProblemCategories,
} from "@/services/problems/problem.helper";
import type {
  PendingProblem,
  PlatformProblemCount,
  ProblemDetail,
  ProblemFiltersState,
  ProblemListItem,
  ProblemTierBucket,
} from "@/types/problem";

export const PROBLEM_PAGE_SIZE = 25;
const PENDING_PROBLEM_LIMIT = 3;

// 필터와 페이지 조건에 맞는 문제 목록을 화면용 데이터로 조회한다.
export async function getProblems({
  filters,
  page,
}: {
  filters: ProblemFiltersState;
  page: number;
}): Promise<ProblemListItem[]> {
  const rows = await findProblems({
    filters,
    page,
    pageSize: PROBLEM_PAGE_SIZE,
  });

  return rows.map((problem) => ({
    categories: normalizeProblemCategories(problem.categories),
    code: `${problem.platform}-${problem.problemId}`,
    createdAt: problem.createdAt,
    id: problem.id,
    platform: problem.platform,
    problemId: problem.problemId,
    status: problem.status,
    submittedAtText: problem.submittedAtText,
    tier: problem.tier,
    title: problem.title,
  }));
}

// 필터 조건에 해당하는 문제 수를 조회한다.
export async function getProblemCount(filters?: ProblemFiltersState) {
  return countProblems(filters);
}

// 문제 필터에 사용할 고유 티어 목록을 조회한다.
export async function getAvailableProblemTiers() {
  const tiers = await findAvailableProblemTiers();

  return tiers.flatMap((item) => item.tier ?? []);
}

// 문제 상세 화면에 필요한 단일 문제 정보를 조회한다.
export async function getProblemDetail(id: string): Promise<ProblemDetail | null> {
  const problem = await findProblemDetail(id);

  return problem
    ? { ...problem, categories: normalizeProblemCategories(problem.categories) }
    : null;
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

// 사용자의 문제 제출 수를 플랫폼별 표시 데이터로 조회한다.
export async function getProblemCountsByPlatform(
  userId: string | undefined,
): Promise<PlatformProblemCount[]> {
  if (!userId) return createPlatformProblemCounts([]);

  return createPlatformProblemCounts(await countProblemsByPlatform(userId));
}

// 사용자의 전체 문제 제출 수를 조회한다.
export async function getSolvedProblemCount(userId: string | undefined) {
  return userId ? countProblemsByUserId(userId) : 0;
}
