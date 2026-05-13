"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProblemPlatform } from "@/generated/prisma/enums";
import type { ProblemFiltersState } from "@/features/problem/types";

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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function replaceQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    params.delete("page");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <FilterCard title="Platform">
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
                {platform}
              </button>
            );
          })}
        </div>
      </FilterCard>
      <FilterCard title="Difficulty Tier">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) => replaceQuery({ tier: event.target.value || null })}
          value={filters.tier}
        >
          <option value="">All Tiers</option>
          {tiers.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
      </FilterCard>
      <FilterCard className="md:col-span-2 xl:col-span-1" title="Search">
        <input
          className="input-field min-h-10"
          defaultValue={filters.q}
          key={filters.q}
          onChange={(event) => {
            const value = event.target.value;
            replaceQuery({ q: value.trim() || null });
          }}
          placeholder="Title or problem ID"
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
    <div
      className={`app-card min-w-0 p-4 ${className ?? ""}`}
    >
      <h2 className="mb-3 block text-label-caps text-slate-500">{title}</h2>
      {children}
    </div>
  );
}
