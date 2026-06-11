"use client";

import { useReplacePaginatedQueryParams } from "@/hooks/use-replace-paginated-query-params";
import type { ProblemSort } from "@/types/problem";

export default function ProblemSortSelect({ sort }: { sort: ProblemSort }) {
  const replaceQuery = useReplacePaginatedQueryParams();

  function handleSortChange(nextSort: ProblemSort) {
    replaceQuery({
      sort: nextSort === "newest" ? null : nextSort,
    });
  }

  return (
    <label className="flex items-center gap-2">
      <span className="text-body-sm font-medium text-slate-400">
        Sort by:
      </span>
      <select
        className="cursor-pointer border-none bg-transparent text-body-sm font-semibold text-primary outline-none"
        onChange={(event) => handleSortChange(event.target.value as ProblemSort)}
        value={sort}
      >
        <option value="newest">Latest Published</option>
        <option value="oldest">Oldest Published</option>
        <option value="title">Title</option>
        <option value="platform">Platform</option>
      </select>
    </label>
  );
}
