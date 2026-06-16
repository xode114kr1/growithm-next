import Link from "next/link";

import { getPendingProblems } from "@/services/problems/problem.query";
import PendingItem from "./pending-item";

export default async function PendingList({
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
              <PendingItem problem={problem} key={problem.id} variant="table" />
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">
        {pendingProblems.map((problem) => (
          <PendingItem key={problem.id} problem={problem} variant="card" />
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

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-8 py-4 text-label-caps text-slate-500">{children}</th>
  );
}
