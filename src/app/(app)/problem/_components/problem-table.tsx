import Link from "next/link";

export type ProblemListItem = {
  categories: string[];
  code: string;
  createdAt: Date;
  id: string;
  platform: string;
  problemId: string;
  submittedAtText: string | null;
  tier: string | null;
  title: string;
};

export default function ProblemTable({
  pageSize,
  problems,
  totalCount,
}: {
  pageSize: number;
  problems: ProblemListItem[];
  totalCount: number;
}) {
  return (
    <section className="app-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <TableHead>Problem Details</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>State</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {problems.map((problem) => (
              <tr
                className="group transition-colors hover:bg-slate-50/80"
                key={problem.id}
              >
                <td className="min-w-[360px] max-w-[560px] px-6 py-5">
                  <Link
                    className="flex items-start gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                    href={`/problem/${problem.id}`}
                  >
                    <span
                      className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm ${getTierBadgeClass(problem.tier)}`}
                    >
                      {getPlatformInitial(problem.platform)}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-[11px] text-slate-500">
                          {problem.code}
                        </span>
                        {problem.tier ? (
                          <span className={getTierBadgeClass(problem.tier)}>
                            {problem.tier}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-pretty break-words font-semibold leading-snug text-on-surface transition-colors group-hover:text-secondary">
                        {problem.title}
                      </h3>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.categories.length > 0 ? (
                      problem.categories.map((tag) => (
                        <span
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-body-sm text-slate-400">No tags</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <ProblemState submittedAtText={problem.submittedAtText} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {problems.length === 0 ? <EmptyState /> : null}
      <Pagination
        pageSize={pageSize}
        showingCount={problems.length}
        totalCount={totalCount}
      />
    </section>
  );
}

function ProblemState({ submittedAtText }: { submittedAtText: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed">
      <span aria-hidden="true">✓</span>
      {submittedAtText ?? "Submitted"}
    </span>
  );
}

function Pagination({
  pageSize,
  showingCount,
  totalCount,
}: {
  pageSize: number;
  showingCount: number;
  totalCount: number;
}) {
  const start = showingCount > 0 ? 1 : 0;
  const end = Math.min(showingCount, pageSize);

  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
      <p className="text-body-sm text-slate-500">
        Showing <span className="font-semibold text-on-surface">{start} - {end}</span>{" "}
        of {totalCount.toLocaleString()} problems
      </p>
      <div className="flex items-center gap-1">
        <button
          className="rounded-lg border border-slate-200 p-2 text-slate-300"
          disabled
        >
          ‹
        </button>
        <div className="flex items-center px-2">
          {[1, 2, 3].map((page) => (
            <button
              className={
                page === 1
                  ? "flex size-9 items-center justify-center rounded-lg bg-primary text-body-sm font-semibold text-on-primary"
                  : "flex size-9 items-center justify-center rounded-lg text-body-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              }
              key={page}
            >
              {page}
            </button>
          ))}
          <span className="px-2 text-sm text-slate-400">...</span>
          <button className="flex size-9 items-center justify-center rounded-lg text-body-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
            50
          </button>
        </div>
        <button className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:bg-white">
          ›
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-t border-slate-100 px-6 py-14 text-center">
      <p className="font-semibold text-on-surface">No problems submitted yet</p>
      <p className="mt-2 text-body-sm text-slate-500">
        Registered submissions will appear here after webhook processing.
      </p>
    </div>
  );
}

function getPlatformInitial(platform: string) {
  return platform.charAt(0);
}

function getTierBadgeClass(tier: string | null) {
  if (tier?.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier?.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  return "badge-tier-silver";
}

function TableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-6 py-4 text-label-caps text-slate-400 ${className ?? ""}`}>
      {children}
    </th>
  );
}
