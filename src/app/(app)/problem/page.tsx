import ProblemFilters from "@/app/(app)/problem/_components/problem-filters";
import ProblemTable from "@/app/(app)/problem/_components/problem-table";
import { getProblemListPageData } from "@/app/(app)/problem/_lib/problem-list-data";
import type {
  ProblemFiltersState,
  ProblemPageSearchParams,
} from "@/app/(app)/problem/_lib/problem-list-types";

type ProblemPageProps = {
  searchParams: Promise<ProblemPageSearchParams>;
};

export default async function ProblemPage({ searchParams }: ProblemPageProps) {
  const {
    currentPage,
    emptyStateReason,
    filters,
    pageSize,
    problems,
    queryString,
    tiers,
    totalCount,
    totalPages,
  } = await getProblemListPageData(await searchParams);

  return (
    <main className="page-shell">
      <div className="page-container">
        <ProblemHeading filters={filters} totalCount={totalCount} />
        <ProblemFilters filters={filters} tiers={tiers} />
        <ProblemTable
          currentPage={currentPage}
          emptyStateReason={emptyStateReason}
          pageSize={pageSize}
          problems={problems}
          queryString={queryString}
          totalCount={totalCount}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}

// Renders the page title and sort control while preserving active filters.
function ProblemHeading({
  filters,
  totalCount,
}: {
  filters: ProblemFiltersState;
  totalCount: number;
}) {
  return (
    <div className="page-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="page-title mb-2">
          Algorithm Repository
        </h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          Curated collection of {totalCount.toLocaleString()} submitted
          challenges across major competitive platforms.
        </p>
      </div>
      <form className="flex items-center gap-2" method="get">
        {filters.platform ? (
          <input name="platform" type="hidden" value={filters.platform} />
        ) : null}
        {filters.tier ? (
          <input name="tier" type="hidden" value={filters.tier} />
        ) : null}
        {filters.q ? <input name="q" type="hidden" value={filters.q} /> : null}
        <label
          className="text-body-sm font-medium text-slate-400"
          htmlFor="problem-sort"
        >
          Sort by:
        </label>
        <select
          className="cursor-pointer border-none bg-transparent text-body-sm font-semibold text-primary outline-none"
          defaultValue={filters.sort}
          id="problem-sort"
          name="sort"
        >
          <option value="newest">Latest Published</option>
          <option value="oldest">Oldest Published</option>
          <option value="title">Title</option>
          <option value="platform">Platform</option>
        </select>
        <button className="btn-secondary min-h-10" type="submit">
          Apply
        </button>
      </form>
    </div>
  );
}
