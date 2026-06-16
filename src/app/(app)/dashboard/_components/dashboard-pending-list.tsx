import Link from "next/link";

import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import { getPendingProblems } from "@/services/problems/problem.query";
import type { PendingProblem } from "@/types/problem";

export default async function DashboardPendingList({
  userId,
}: {
  userId: string | undefined;
}) {
  const pendingProblems = await getPendingProblems(userId);

  return (
    <section className="app-card mb-12 overflow-hidden md:col-span-12">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 p-6 lg:p-8">
        <h2 className="section-title">최근 푼 문제</h2>
        <Link
          className="text-body-sm font-semibold whitespace-nowrap text-secondary hover:underline"
          href="/problem"
        >
          전체 문제 보기
        </Link>
      </div>
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <TableHead>문제 이름</TableHead>
              <TableHead>플랫폼</TableHead>
              <TableHead>티어</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pendingProblems.map((problem) => (
              <tr
                className="group transition-colors hover:bg-slate-50/50"
                key={problem.id}
              >
                <td className="p-0 font-semibold text-on-background">
                  <Link
                    className="block px-8 py-5 transition-colors group-hover:text-secondary"
                    href={`/problem/${problem.id}`}
                  >
                    {problem.title}
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    className="block px-8 py-5"
                    href={`/problem/${problem.id}`}
                  >
                    <span className="rounded bg-slate-100 px-2 py-1 text-mono-code text-xs text-slate-600">
                      {getProblemCode(problem)}
                    </span>
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    className="block px-8 py-5"
                    href={`/problem/${problem.id}`}
                  >
                    <ProblemTierBadge
                      className="shadow-sm"
                      tier={problem.tier}
                    />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">
        {pendingProblems.map((problem) => (
          <Link
            className="block p-5 transition-colors hover:bg-slate-50/50"
            href={`/problem/${problem.id}`}
            key={problem.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-mono-code text-xs text-slate-600">
                {getProblemCode(problem)}
              </span>
              <ProblemTierBadge className="shadow-sm" tier={problem.tier} />
            </div>
            <h3 className="mt-3 wrap-break-word font-semibold leading-snug text-on-background">
              {problem.title}
            </h3>
          </Link>
        ))}
      </div>
      {pendingProblems.length === 0 ? (
        <div className="border-t border-slate-50 px-6 py-12 text-center">
          <p className="font-semibold text-on-surface">
            작성할 메모가 없습니다.
          </p>
          <p className="mt-2 text-body-sm text-slate-500">
            제출 후 메모가 필요한 문제가 이곳에 표시됩니다.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function getProblemCode(problem: PendingProblem) {
  return `${problem.platform}-${problem.problemId}`;
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-8 py-4 text-label-caps text-slate-500">{children}</th>
  );
}
