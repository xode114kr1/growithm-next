"use client";

export type StudyProblemSort =
  | "latest"
  | "oldest"
  | "title"
  | "tier"
  | "member";

export default function StudyProblemFilters({
  filteredCount,
  memberNames,
  onClearFilters,
  onPlatformChange,
  onSharedByChange,
  onSortChange,
  onTierChange,
  platformFilter,
  sharedByFilter,
  sort,
  tiers,
  tierFilter,
  totalCount,
}: {
  filteredCount: number;
  memberNames: string[];
  onClearFilters: () => void;
  onPlatformChange: (platform: string) => void;
  onSharedByChange: (sharedBy: string) => void;
  onSortChange: (sort: StudyProblemSort) => void;
  onTierChange: (tier: string) => void;
  platformFilter: string;
  sharedByFilter: string;
  sort: StudyProblemSort;
  tiers: string[];
  tierFilter: string;
  totalCount: number;
}) {
  const hasActiveFilters =
    platformFilter !== "All" || tierFilter !== "All" || sharedByFilter !== "All";

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <FilterCard title="플랫폼">
        <div className="flex flex-wrap gap-2">
          {["All", "BAEKJOON", "PROGRAMMERS"].map((platform) => (
            <button
              aria-pressed={platformFilter === platform}
              className={
                platformFilter === platform
                  ? "rounded-lg border border-primary-container/20 bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container"
                  : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-body-sm font-medium text-slate-600 transition-colors hover:border-primary-container hover:text-primary"
              }
              key={platform}
              onClick={() => onPlatformChange(platform)}
              type="button"
            >
              {platform === "All" ? "전체" : platform}
            </button>
          ))}
        </div>
      </FilterCard>
      <FilterCard title="티어">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) => onTierChange(event.target.value)}
          value={tierFilter}
        >
          <option value="All">전체</option>
          {tiers.map((tier) => (
            <option key={tier}>{tier}</option>
          ))}
        </select>
      </FilterCard>
      <FilterCard title="공유한 멤버">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) => onSharedByChange(event.target.value)}
          value={sharedByFilter}
        >
          <option value="All">전체</option>
          {memberNames.map((memberName) => (
            <option key={memberName}>{memberName}</option>
          ))}
        </select>
      </FilterCard>
      <FilterCard title="정렬">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) =>
            onSortChange(event.target.value as StudyProblemSort)
          }
          value={sort}
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
              onClick={onClearFilters}
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
