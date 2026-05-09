"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProblemSort } from "@/app/(app)/problem/_lib/problem-list-types";

export default function ProblemSortSelect({ sort }: { sort: ProblemSort }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSortChange(nextSort: ProblemSort) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }

    params.delete("page");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
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
