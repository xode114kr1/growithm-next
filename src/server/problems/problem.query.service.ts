import "server-only";

import {
  countProblems,
  countProblemsByUserId,
  findAvailableProblemTiers,
  findPendingProblemsByUserId,
  findProblemDetail,
  findProblems,
  findProblemTiersByUserId,
} from "@/server/problems/problem.repository";
import {
  createPendingProblem,
  createProblemDetail,
  createProblemListItem,
  createProblemTierBuckets,
} from "@/server/problems/problem.mapper";
import type {
  PendingProblem,
  ProblemDetail,
  ProblemFiltersState,
  ProblemListItem,
  ProblemTierBucket,
} from "@/types/problem";

export const PROBLEM_PAGE_SIZE = 25;
const PENDING_PROBLEM_LIMIT = 3;

type ProblemListPage = {
  hasNextPage: boolean;
  items: ProblemListItem[];
  nextCursor: string | null;
};

// 필터와 커서 조건에 맞는 문제 목록을 화면용 데이터로 조회한다.
export async function getProblems({
  cursor = null,
  filters,
  userId,
}: {
  cursor?: string | null;
  filters: ProblemFiltersState;
  userId: string | undefined;
}): Promise<ProblemListPage> {
  if (!userId) {
    return {
      hasNextPage: false,
      items: [],
      nextCursor: null,
    };
  }

  const problems = await findProblems({
    cursor,
    filters,
    pageSize: PROBLEM_PAGE_SIZE,
    userId,
  });
  const hasNextPage = problems.length > PROBLEM_PAGE_SIZE;
  const items = problems
    .slice(0, PROBLEM_PAGE_SIZE)
    .map(createProblemListItem);
  const lastItem = items.at(-1);

  return {
    hasNextPage,
    items,
    nextCursor: hasNextPage && lastItem ? lastItem.id : null,
  };
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

  const problemTiers = await findProblemTiersByUserId(userId);

  return createProblemTierBuckets(problemTiers);
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
