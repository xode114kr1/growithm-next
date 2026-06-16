import { ProblemPlatform } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import {
  getAvailableProblemTiers,
  getProblemCount,
  getProblems,
  PROBLEM_PAGE_SIZE,
} from "@/services/problems/problem.query";
import type {
  ProblemFiltersState,
  ProblemPageSearchParams,
  ProblemSort,
} from "@/types/problem";

import ProblemFilters from "./_components/problem-filters";
import ProblemList from "./_components/problem-list";

type ProblemPageProps = {
  searchParams: Promise<ProblemPageSearchParams>;
};

export default async function ProblemPage({ searchParams }: ProblemPageProps) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  const filters = parseFilters(params);
  const requestedPage = parsePageParam(params.page);
  const [tiers, unfilteredTotalCount, totalCount] = await Promise.all([
    getAvailableProblemTiers(userId),
    getProblemCount(userId),
    getProblemCount(userId, filters),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PROBLEM_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const problems = await getProblems({ filters, page: currentPage, userId });
  const emptyStateReason =
    totalCount > 0
      ? null
      : unfilteredTotalCount > 0
        ? "no-filter-results"
        : "no-submissions";

  return (
    <main className="page-shell">
      <div className="page-container">
        <ProblemFilters filters={filters} tiers={tiers} />
        <ProblemList
          currentPage={currentPage}
          emptyStateReason={emptyStateReason}
          pageSize={PROBLEM_PAGE_SIZE}
          problems={problems}
          queryString={buildQueryString(params)}
          totalCount={totalCount}
          totalPages={totalPages}
        />
      </div>
    </main>
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
