"use client";

import {
  FilterCard,
  FilterSelect,
} from "@/components/ui/filter-card";
import type { ProblemPlatform } from "@/generated/prisma/enums";
import { useReplaceQueryParams } from "@/hooks/use-query-params";
import type { ProblemFiltersState, ProblemSort } from "@/types/problem";

const platformOptions: Array<{
  label: string;
  value: ProblemPlatform | "";
}> = [
  { label: "전체 플랫폼", value: "" },
  { label: "BAEKJOON", value: "BAEKJOON" },
  { label: "PROGRAMMERS", value: "PROGRAMMERS" },
];

export default function ProblemFilters({
  filters,
  tiers,
  totalCount,
}: {
  filters: ProblemFiltersState;
  tiers: string[];
  totalCount: number;
}) {
  const replaceQuery = useReplaceQueryParams();

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      <FilterCard className="md:col-span-2 xl:col-span-2" title="검색">
        <input
          className="input-field min-h-10"
          defaultValue={filters.q}
          onChange={(event) => {
            const value = event.target.value;
            replaceQuery({ q: value.trim() || null });
          }}
          placeholder="문제 제목 또는 ID"
          type="search"
        />
      </FilterCard>
      <FilterCard className="xl:col-span-2" title="필터">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <label>
            <span className="sr-only">플랫폼</span>
            <FilterSelect
              onChange={(event) =>
                replaceQuery({ platform: event.target.value || null })
              }
              value={filters.platform ?? ""}
            >
              {platformOptions.map((platform) => (
                <option key={platform.value || "All"} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </FilterSelect>
          </label>
          <label>
            <span className="sr-only">난이도 티어</span>
            <FilterSelect
              onChange={(event) =>
                replaceQuery({ tier: event.target.value || null })
              }
              value={filters.tier}
            >
              <option value="">전체 티어</option>
              {tiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </FilterSelect>
          </label>
        </div>
      </FilterCard>
      <FilterCard title="정렬">
        <FilterSelect
          onChange={(event) => {
            const sort = event.target.value as ProblemSort;
            replaceQuery({ sort: sort === "newest" ? null : sort });
          }}
          value={filters.sort}
        >
          <option value="newest">최신 제출순</option>
          <option value="oldest">오래된 제출순</option>
          <option value="title">제목순</option>
          <option value="platform">플랫폼순</option>
        </FilterSelect>
      </FilterCard>
      <FilterCard title="결과">
        <div className="flex min-h-10 items-end">
          <div>
            <p className="text-h3-ui text-primary">
              {totalCount.toLocaleString()}
            </p>
            <p className="text-body-sm text-slate-500">총 문제</p>
          </div>
        </div>
      </FilterCard>
    </section>
  );
}
