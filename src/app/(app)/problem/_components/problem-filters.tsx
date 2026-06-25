"use client";

import {
  FilterCard,
  FilterOptionButton,
  FilterSelect,
} from "@/components/ui/filter-card";
import type { ProblemPlatform } from "@/generated/prisma/enums";
import { useReplaceQueryParams } from "@/hooks/use-query-params";
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
  const replaceQuery = useReplaceQueryParams();

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <FilterCard className="md:col-span-2 xl:col-span-1" title="검색">
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
      <FilterCard title="플랫폼">
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const isActive =
              platform === "All"
                ? filters.platform === null
                : filters.platform === platform;

            return (
              <FilterOptionButton
                isActive={isActive}
                key={platform}
                onClick={() =>
                  replaceQuery({
                    platform: platform === "All" ? null : platform,
                  })
                }
              >
                {platform === "All" ? "전체" : platform}
              </FilterOptionButton>
            );
          })}
        </div>
      </FilterCard>
      <FilterCard title="난이도 티어">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
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
          <label>
            <span className="sr-only">정렬</span>
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
          </label>
        </div>
      </FilterCard>
    </section>
  );
}
