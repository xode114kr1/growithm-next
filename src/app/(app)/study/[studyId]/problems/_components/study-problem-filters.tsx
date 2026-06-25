"use client";

import { Button } from "@/components/ui/button";
import {
  FilterCard,
  FilterOptionButton,
  FilterSelect,
} from "@/components/ui/filter-card";
import type { ProblemPlatform } from "@/generated/prisma/enums";
import { useReplaceQueryParams } from "@/hooks/use-query-params";

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
  const replaceQuery = useReplaceQueryParams();
  const hasActiveFilters =
    filters.platform !== null ||
    filters.tier !== null ||
    filters.member !== null;

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <FilterCard className="xl:col-span-2" title="플랫폼">
        <div className="flex flex-wrap gap-2">
          {["All", "BAEKJOON", "PROGRAMMERS"].map((platform) => {
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
                    platform:
                      platform === "All"
                        ? null
                        : (platform as ProblemPlatform),
                  })
                }
              >
                {platform === "All" ? "전체" : platform}
              </FilterOptionButton>
            );
          })}
        </div>
      </FilterCard>
      <FilterCard title="필터">
        <div className="grid gap-3">
          <label>
            <span className="sr-only">티어</span>
            <FilterSelect
              onChange={(event) =>
                replaceQuery({ tier: event.target.value || null })
              }
              value={filters.tier ?? ""}
            >
              <option value="">전체 티어</option>
              {tiers.map((tier) => (
                <option key={tier}>{tier}</option>
              ))}
            </FilterSelect>
          </label>
          <label>
            <span className="sr-only">공유한 멤버</span>
            <FilterSelect
              onChange={(event) =>
                replaceQuery({ member: event.target.value || null })
              }
              value={filters.member ?? ""}
            >
              <option value="">전체 멤버</option>
              {memberNames.map((memberName) => (
                <option key={memberName}>{memberName}</option>
              ))}
            </FilterSelect>
          </label>
        </div>
      </FilterCard>
      <FilterCard title="정렬">
        <FilterSelect
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
        </FilterSelect>
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
            <Button
              onClick={() =>
                replaceQuery({
                  member: null,
                  platform: null,
                  tier: null,
                })
              }
              size="xs"
              variant="secondary"
            >
              Reset
            </Button>
          ) : null}
        </div>
      </FilterCard>
    </section>
  );
}
