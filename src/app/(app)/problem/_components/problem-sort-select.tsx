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
        정렬:
      </span>
      <select
        className="cursor-pointer border-none bg-transparent text-body-sm font-semibold text-primary outline-none"
        onChange={(event) => handleSortChange(event.target.value as ProblemSort)}
        value={sort}
      >
        <option value="newest">최신 제출순</option>
        <option value="oldest">오래된 제출순</option>
        <option value="title">제목순</option>
        <option value="platform">플랫폼순</option>
      </select>
    </label>
  );
}
