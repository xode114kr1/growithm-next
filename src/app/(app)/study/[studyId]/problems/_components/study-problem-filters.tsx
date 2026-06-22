"use client";

import type { ProblemPlatform } from "@/generated/prisma/enums";
import { useReplacePaginatedQueryParams } from "@/hooks/use-paginated-query-params";

import type { StudyProblemFilters, StudyProblemSort } from "../types";

export default function StudyProblemFilters({
  filters,
  filteredCount,
  memberNames,
  tiers,
  totalCount,
}: {
  filters: StudyProblemFilters;
  filteredCount: number;
  memberNames: string[];
  tiers: string[];
  totalCount: number;
}) {
  const replaceQuery = useReplacePaginatedQueryParams();
  const hasActiveFilters =
    filters.platform !== null ||
    filters.tier !== null ||
    filters.member !== null;

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <FilterCard title="플랫폼">
        <div className="flex flex-wrap gap-2">
          {["All", "BAEKJOON", "PROGRAMMERS"].map((platform) => {
            const isActive =
                platform === "All"
                  ? filters.platform === null
                  : filters.platform === platform;

            return (
              <button
                aria-pressed={isActive}
                className={
                  isActive
                  ? "rounded-lg border border-primary-container/20 bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container"
                  : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-body-sm font-medium text-slate-600 transition-colors hover:border-primary-container hover:text-primary"
                }
                key={platform}
                onClick={() =>
                  replaceQuery({
                    platform:
                      platform === "All"
                        ? null
                        : (platform as ProblemPlatform),
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
      <FilterCard title="티어">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) =>
            replaceQuery({ tier: event.target.value || null })
          }
          value={filters.tier ?? ""}
        >
          <option value="">전체</option>
          {tiers.map((tier) => (
            <option key={tier}>{tier}</option>
          ))}
        </select>
      </FilterCard>
      <FilterCard title="공유한 멤버">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) =>
            replaceQuery({ member: event.target.value || null })
          }
          value={filters.member ?? ""}
        >
          <option value="">전체</option>
          {memberNames.map((memberName) => (
            <option key={memberName}>{memberName}</option>
          ))}
        </select>
      </FilterCard>
      <FilterCard title="정렬">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) => {
            const sort = event.target.value as StudyProblemSort;
            replaceQuery({ sort: sort === "latest" ? null : sort });
          }}
          value={filters.sort}
        >
          <option value="latest">최근 공유순</option>
          <option value="oldest">오래된 공유순</option>
          <option value="title">제목순</option>
          <option value="tier">티어순</option>
          <option value="member">멤버순</option>
        </select>
      </FilterCard>
      <FilterCard title="결과">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-h3-ui text-primary">
              {filteredCount.toLocaleString()}
            </p>
            <p className="text-body-sm text-slate-500">
              전체 {totalCount.toLocaleString()}개
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-body-sm font-semibold text-slate-600 transition-colors hover:border-secondary hover:text-secondary"
              onClick={() =>
                replaceQuery({
                  member: null,
                  platform: null,
                  tier: null,
                })
              }
              type="button"
            >
              Reset
            </button>
          ) : null}
        </div>
      </FilterCard>
    </section>
  );
}

function FilterCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="app-card min-w-0 p-4">
      <h2 className="mb-3 block text-label-caps text-slate-500">{title}</h2>
      {children}
    </div>
  );
}
