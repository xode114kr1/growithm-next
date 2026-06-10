import Link from "next/link";

import { getTierBadgeClass } from "@/features/problem/utils";
import type { DashboardPendingProblem } from "@/types/dashboard";

export default function PendingAnalysis({
  pendingProblems,
}: {
  pendingProblems: DashboardPendingProblem[];
}) {
  return (
    <section className="app-card mb-12 overflow-hidden md:col-span-12">
      <div className="flex items-center justify-between border-b border-slate-50 p-6 lg:p-8">
        <h2 className="section-title">Pending Analysis</h2>
        <Link
          className="text-body-sm font-semibold text-secondary hover:underline"
          href="/problem"
        >
          View All Backlog
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <TableHead>Problem Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pendingProblems.map((problem) => (
              <tr
                className="transition-colors hover:bg-slate-50/50"
                key={problem.id}
              >
                <td className="px-8 py-5 font-semibold text-on-background">
                  {problem.title}
                </td>
                <td className="px-8 py-5">
                  <span className="rounded bg-slate-100 px-2 py-1 text-mono-code text-xs text-slate-600">
                    {getProblemCode(problem)}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`${getTierBadgeClass(problem.tier)} shadow-sm`}>
                    {problem.tier}
                  </span>
                </td>
                <td className="px-8 py-5 text-body-sm text-slate-500">
                  {problem.submittedAtText}
                </td>
                <td className="px-8 py-5 text-right">
                  <Link
                    className="rounded-lg bg-secondary-container px-4 py-2 text-body-sm font-bold text-secondary transition-colors hover:bg-secondary-fixed"
                    href={`/problem/${problem.id}`}
                  >
                    Write Analysis
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pendingProblems.length === 0 ? (
        <div className="border-t border-slate-50 px-6 py-12 text-center">
          <p className="font-semibold text-on-surface">No pending analysis</p>
          <p className="mt-2 text-body-sm text-slate-500">
            Problems that need a memo will appear here after submission.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function getProblemCode(problem: DashboardPendingProblem) {
  return `${problem.platform}-${problem.problemId}`;
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
