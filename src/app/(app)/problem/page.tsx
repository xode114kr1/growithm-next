import ProblemFilters from "@/features/problem/components/problem-filters";
import ProblemSortSelect from "@/features/problem/components/problem-sort-select";
import ProblemTable from "@/features/problem/components/problem-table";
import { getProblemListPageData } from "@/features/problem/server/problem-list-data";
import type {
  ProblemFiltersState,
  ProblemPageSearchParams,
} from "@/features/problem/types";

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

// 현재 필터를 유지하면서 페이지 제목과 정렬 컨트롤을 렌더링한다.
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
      <ProblemSortSelect sort={filters.sort} />
    </div>
  );
}
