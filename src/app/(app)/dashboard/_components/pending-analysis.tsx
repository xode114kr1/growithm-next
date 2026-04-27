const pendingProblems = [
  {
    name: "Longest Increasing Subsequence",
    platform: "Baekjoon 11053",
    tier: "Silver I",
    tierClass: "badge-tier-silver",
    time: "2 hours ago",
  },
  {
    name: "Network Flow: Ford-Fulkerson",
    platform: "Programmers Lvl 4",
    tier: "Platinum V",
    tierClass: "badge-tier-platinum",
    time: "5 hours ago",
  },
  {
    name: "2D Segment Tree Optimization",
    platform: "Baekjoon 2042",
    tier: "Gold II",
    tierClass: "badge-tier-gold",
    time: "Yesterday",
  },
];

export default function PendingAnalysis() {
  return (
    <section className="app-card mb-12 overflow-hidden md:col-span-12">
      <div className="flex items-center justify-between border-b border-slate-50 p-6 lg:p-8">
        <h2 className="section-title">Pending Analysis</h2>
        <button className="text-body-sm font-semibold text-secondary hover:underline">
          View All Backlog
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <TableHead>Problem Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Time Since Solved</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pendingProblems.map((problem) => (
              <tr
                className="transition-colors hover:bg-slate-50/50"
                key={problem.name}
              >
                <td className="px-8 py-5 font-semibold text-on-background">
                  {problem.name}
                </td>
                <td className="px-8 py-5">
                  <span className="rounded bg-slate-100 px-2 py-1 text-mono-code text-xs text-slate-600">
                    {problem.platform}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`${problem.tierClass} shadow-sm`}>
                    {problem.tier}
                  </span>
                </td>
                <td className="px-8 py-5 text-body-sm text-slate-500">
                  {problem.time}
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="rounded-lg bg-secondary-container px-4 py-2 text-body-sm font-bold text-secondary">
                    Write Analysis
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
    <th
      className={`px-8 py-4 text-label-caps text-slate-500 ${className ?? ""}`}
    >
      {children}
    </th>
  );
}
