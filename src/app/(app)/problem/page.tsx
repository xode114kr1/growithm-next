import { auth } from "@/lib/auth/auth";
import type {
  ProblemEmptyStateReason,
  ProblemPageSearchParams,
} from "@/types/problem";

import {
  getAvailableProblemTiers,
  getProblemCount,
  getProblems,
  PROBLEM_PAGE_SIZE,
} from "@/services/problems/problem.query";
import {
  parseProblemFilters,
  parseProblemPage,
} from "@/services/problems/problem.validator";
import { buildQueryString } from "./_lib/parse";
import ProblemFilters from "./_components/problem-filters";
import ProblemList from "./_components/problem-list";

type ProblemPageProps = {
  searchParams: Promise<ProblemPageSearchParams>;
};

export default async function ProblemPage({ searchParams }: ProblemPageProps) {
  // params와 id호출
  const params = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  // paese filters
  const filters = parseProblemFilters(params);
  const requestedPage = parseProblemPage(params.page);
  const queryString = buildQueryString(params);

  // fetch
  const [tiers, unfilteredTotalCount, totalCount] = await Promise.all([
    getAvailableProblemTiers(userId),
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
    <main className="page-shell">
      <div className="page-container">
        <ProblemFilters filters={filters} tiers={tiers} />
        <ProblemList
          currentPage={currentPage}
          emptyStateReason={emptyStateReason}
          pageSize={PROBLEM_PAGE_SIZE}
          problems={problems}
          queryString={queryString}
          totalCount={totalCount}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}
