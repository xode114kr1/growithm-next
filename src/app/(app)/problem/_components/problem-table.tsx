const problems = [
  {
    code: "BJ-1920",
    icon: "★",
    iconClass: "badge-tier-platinum",
    name: "Finding Numbers",
    state: "Completed",
    tags: ["Binary Search", "Sorting"],
  },
  {
    code: "PG-42888",
    icon: "◆",
    iconClass: "badge-tier-gold",
    name: "Open Chat Room With User Record Replacement And Notification History",
    state: "Pending",
    tags: ["Implementation", "Hash Map"],
  },
  {
    code: "BJ-1260",
    icon: "◆",
    iconClass: "badge-tier-silver",
    name: "DFS and BFS",
    state: "Completed",
    tags: ["Graph Theory", "BFS", "DFS"],
  },
  {
    code: "BJ-1753",
    icon: "★",
    iconClass: "badge-tier-platinum",
    name: "Shortest Path",
    state: "Pending",
    tags: ["Dijkstra", "Priority Queue"],
  },
];

export default function ProblemTable() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
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
                key={problem.code}
              >
                <td className="min-w-[360px] max-w-[560px] px-6 py-5">
                  <div className="flex items-start gap-4">
                    <span
                      className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm ${problem.iconClass}`}
                    >
                      {problem.icon}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-[11px] text-slate-500">
                          {problem.code}
                        </span>
                      </div>
                      <h3 className="text-pretty break-words font-semibold leading-snug text-on-surface transition-colors group-hover:text-secondary">
                        {problem.name}
                      </h3>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((tag) => (
                      <span
                        className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <ProblemState state={problem.state} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </section>
  );
}

function ProblemState({ state }: { state: string }) {
  if (state === "Completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed">
        <span aria-hidden="true">✓</span>
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-body-sm font-semibold text-slate-500">
      Pending
    </span>
  );
}

function Pagination() {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
      <p className="text-body-sm text-slate-500">
        Showing <span className="font-semibold text-on-surface">1 - 25</span>{" "}
        of 1,248 problems
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
