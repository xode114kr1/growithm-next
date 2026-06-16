import { ProblemPlatform } from "@/generated/prisma/enums";
import {
  getProblemCount,
  getProblems,
  PROBLEM_PAGE_SIZE,
} from "@/services/problems/problem.query";
import {
  ProblemEmptyStateReason,
  ProblemFiltersState,
  ProblemPageSearchParams,
  ProblemSort,
} from "@/types/problem";
import ProblemList from "./problem-list";

export default async function ProblemListSection({
  searchParams,
  userId,
}: {
  searchParams: ProblemPageSearchParams;
  userId: string | undefined;
}) {
  const filters = parseFilters(searchParams);
  const requestedPage = parsePageParam(searchParams.page);
  const queryString = buildQueryString(searchParams);

  const [unfilteredTotalCount, totalCount] = await Promise.all([
    getProblemCount(userId),
    getProblemCount(userId, filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PROBLEM_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const problems = await getProblems({
    filters,
    page: currentPage,
    userId,
  });

  const emptyStateReason: ProblemEmptyStateReason | null =
    totalCount > 0
      ? null
      : unfilteredTotalCount > 0
        ? "no-filter-results"
        : "no-submissions";

  return (
    <ProblemList
      currentPage={currentPage}
      emptyStateReason={emptyStateReason}
      pageSize={PROBLEM_PAGE_SIZE}
      problems={problems}
      queryString={queryString}
      totalCount={totalCount}
      totalPages={totalPages}
    />
  );
}

function parseFilters(params: ProblemPageSearchParams): ProblemFiltersState {
  return {
    platform: parsePlatformParam(params.platform),
    q: parseStringParam(params.q),
    sort: parseSortParam(params.sort),
    tier: parseStringParam(params.tier),
  };
}

function parsePageParam(page: string | string[] | undefined) {
  const parsedPage = Number(parseStringParam(page));

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function parsePlatformParam(platform: string | string[] | undefined) {
  const value = parseStringParam(platform);

  return value === ProblemPlatform.BAEKJOON ||
    value === ProblemPlatform.PROGRAMMERS
    ? value
    : null;
}

function parseSortParam(sort: string | string[] | undefined): ProblemSort {
  const value = parseStringParam(sort);

  return value === "oldest" || value === "title" || value === "platform"
    ? value
    : "newest";
}

function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}

function buildQueryString(params: ProblemPageSearchParams) {
  const query = new URLSearchParams();

  for (const key of ["platform", "tier", "q", "sort"] as const) {
    const value = parseStringParam(params[key]);

    if (value) {
      query.set(key, value);
    }
  }

  return query.toString();
}
