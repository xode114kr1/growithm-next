import Link from "next/link";

import type { ProblemPlatform } from "@/generated/prisma/enums";

const platforms: Array<ProblemPlatform | "All"> = [
  "All",
  "BAEKJOON",
  "PROGRAMMERS",
];

export type ProblemFiltersState = {
  platform: ProblemPlatform | null;
  q: string;
  tier: string;
};

export default function ProblemFilters({
  filters,
  tiers,
}: {
  filters: ProblemFiltersState;
  tiers: string[];
}) {
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
              <Link
              className={
                isActive
                  ? "rounded-lg border border-primary-container/20 bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container"
                  : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-body-sm font-medium text-slate-600 transition-colors hover:border-primary-container"
              }
              href={getPlatformHref(platform, filters)}
              key={platform}
            >
              {platform}
              </Link>
            );
          })}
        </div>
      </FilterCard>
      <FilterCard title="Difficulty Tier">
        <form className="space-y-3" method="get">
          {filters.platform ? (
            <input name="platform" type="hidden" value={filters.platform} />
          ) : null}
          {filters.q ? <input name="q" type="hidden" value={filters.q} /> : null}
          <select
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            defaultValue={filters.tier}
            name="tier"
          >
            <option value="">All Tiers</option>
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
          <button className="btn-secondary min-h-10 w-full" type="submit">
            Apply
          </button>
        </form>
      </FilterCard>
      <FilterCard className="md:col-span-2 xl:col-span-1" title="Search">
        <form className="space-y-3" method="get">
          {filters.platform ? (
            <input name="platform" type="hidden" value={filters.platform} />
          ) : null}
          {filters.tier ? (
            <input name="tier" type="hidden" value={filters.tier} />
          ) : null}
          <input
            className="input-field min-h-10"
            defaultValue={filters.q}
            name="q"
            placeholder="Title or problem ID"
            type="search"
          />
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary min-h-10" type="submit">
              Search
            </button>
            <Link className="btn-secondary min-h-10" href="/problem">
              Reset
            </Link>
          </div>
        </form>
      </FilterCard>
    </section>
  );
}

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

function getPlatformHref(
  platform: ProblemPlatform | "All",
  filters: ProblemFiltersState,
) {
  const params = new URLSearchParams();

  if (platform !== "All") {
    params.set("platform", platform);
  }

  if (filters.tier) {
    params.set("tier", filters.tier);
  }

  if (filters.q) {
    params.set("q", filters.q);
  }

  const queryString = params.toString();

  return queryString ? `/problem?${queryString}` : "/problem";
}
