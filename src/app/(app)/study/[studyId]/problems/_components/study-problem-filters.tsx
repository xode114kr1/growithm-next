"use client";

import { Button } from "@/components/ui/button";
import { FilterCard, FilterSelect } from "@/components/ui/filter-card";
import type { ProblemPlatform } from "@/generated/prisma/enums";
import { useReplaceQueryParams } from "@/hooks/use-query-params";

import type { StudyProblemFilters, StudyProblemSort } from "../types";

const platformOptions: Array<{
  label: string;
  value: ProblemPlatform | "";
}> = [
  { label: "전체 플랫폼", value: "" },
  { label: "BAEKJOON", value: "BAEKJOON" },
  { label: "PROGRAMMERS", value: "PROGRAMMERS" },
];

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
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      <FilterCard title="필터">
        <div className="grid gap-3 md:grid-cols-2">
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
        </div>
      </FilterCard>
      <FilterCard title="멤버">
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
