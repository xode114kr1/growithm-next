import Link from "next/link";

import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import { getPendingProblems } from "@/services/problems/problem.query";
import type { PendingProblem } from "@/types/problem";

export default async function PendingAnalysis({
  userId,
}: {
  userId: string | undefined;
}) {
  const pendingProblems = await getPendingProblems(userId);

  return (
    <section className="app-card mb-12 overflow-hidden md:col-span-12">
      <div className="flex items-center justify-between border-b border-slate-50 p-6 lg:p-8">
        <h2 className="section-title">메모 작성 대기</h2>
        <Link
          className="text-body-sm font-semibold text-secondary hover:underline"
          href="/problem"
        >
          전체 문제 보기
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <TableHead>문제 이름</TableHead>
              <TableHead>플랫폼</TableHead>
              <TableHead>티어</TableHead>
              <TableHead>제출일</TableHead>
              <TableHead className="text-right">작업</TableHead>
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
                  <ProblemTierBadge className="shadow-sm" tier={problem.tier} />
                </td>
                <td className="px-8 py-5 text-body-sm text-slate-500">
                  {problem.submittedAtText}
                </td>
                <td className="px-8 py-5 text-right">
                  <Link
                    className="rounded-lg bg-secondary-container px-4 py-2 text-body-sm font-bold text-secondary transition-colors hover:bg-secondary-fixed"
                    href={`/problem/${problem.id}`}
                  >
                    메모 작성
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pendingProblems.length === 0 ? (
        <div className="border-t border-slate-50 px-6 py-12 text-center">
          <p className="font-semibold text-on-surface">작성할 메모가 없습니다.</p>
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
