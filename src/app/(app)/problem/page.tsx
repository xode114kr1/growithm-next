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
} from "@/server/problems/problem.query";
import { parseProblemFilters } from "@/server/problems/problem.validator";
import ProblemFilters from "./_components/problem-filters";
import ProblemList from "./_components/problem-list/problem-list";

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

  // fetch
  const [tiers, unfilteredTotalCount, totalCount, initialItems] =
    await Promise.all([
      getAvailableProblemTiers(userId),
      getProblemCount(userId),
      getProblemCount(userId, filters),
      getProblems({
        filters,
        page: 1,
        userId,
      }),
    ]);

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
          emptyStateReason={emptyStateReason}
          filters={filters}
          initialHasNextPage={PROBLEM_PAGE_SIZE < totalCount}
          initialItems={initialItems}
          key={createProblemListKey(filters)}
        />
      </div>
    </main>
  );
}

function createProblemListKey(filters: {
  platform: string | null;
  q: string;
  sort: string;
  tier: string;
}) {
  return new URLSearchParams({
    platform: filters.platform ?? "",
    q: filters.q,
    sort: filters.sort,
    tier: filters.tier,
  }).toString();
}
