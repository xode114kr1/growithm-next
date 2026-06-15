"use client";

import type { ProblemPlatform } from "@/generated/prisma/enums";
import { useReplacePaginatedQueryParams } from "@/hooks/use-replace-paginated-query-params";
import type { ProblemFiltersState, ProblemSort } from "@/types/problem";

const platforms: Array<ProblemPlatform | "All"> = [
  "All",
  "BAEKJOON",
  "PROGRAMMERS",
];

export default function ProblemFilters({
  filters,
  tiers,
}: {
  filters: ProblemFiltersState;
  tiers: string[];
}) {
  const replaceQuery = useReplacePaginatedQueryParams();

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <FilterCard title="플랫폼">
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const isActive =
              platform === "All"
                ? filters.platform === null
                : filters.platform === platform;

            return (
              <button
                className={
                  isActive
                    ? "rounded-lg border border-primary-container/20 bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container"
                    : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-body-sm font-medium text-slate-600 transition-colors hover:border-primary-container"
                }
                key={platform}
                onClick={() =>
                  replaceQuery({
                    platform: platform === "All" ? null : platform,
                  })
                }
                type="button"
              >
                {platform === "All" ? "전체" : platform}
              </button>
            );
          })}
        </div>
      </FilterCard>
      <FilterCard title="난이도 티어">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <label>
            <span className="sr-only">난이도 티어</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
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
            </select>
          </label>
          <label>
            <span className="sr-only">정렬</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
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
            </select>
          </label>
        </div>
      </FilterCard>
      <FilterCard className="md:col-span-2 xl:col-span-1" title="검색">
        <input
          className="input-field min-h-10"
          defaultValue={filters.q}
          key={filters.q}
          onChange={(event) => {
            const value = event.target.value;
            replaceQuery({ q: value.trim() || null });
          }}
          placeholder="문제 제목 또는 ID"
          type="search"
        />
      </FilterCard>
    </section>
  );
}

// 각 필터 그룹에서 공통으로 쓰는 카드 프레임을 제공한다.
function FilterCard({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <div className={`app-card min-w-0 p-4 ${className ?? ""}`}>
      <h2 className="mb-3 block text-label-caps text-slate-500">{title}</h2>
      {children}
    </div>
  );
}
