import Link from "next/link";

import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import type { PendingProblem } from "@/types/problem";

export default function PendingItem({
  problem,
  variant,
}: {
  problem: PendingProblem;
  variant: "table" | "card";
}) {
  if (variant === "card") {
    return <PendingCard problem={problem} />;
  }

  return <PendingRow problem={problem} />;
}

function PendingRow({ problem }: { problem: PendingProblem }) {
  return (
    <tr className="group transition-colors hover:bg-slate-50/50">
      <td className="p-0 font-semibold text-on-background">
        <Link
          className="block px-8 py-5 transition-colors group-hover:text-secondary"
          href={`/problem/${problem.id}`}
        >
          {problem.title}
        </Link>
      </td>

      <td className="p-0">
        <Link className="block px-8 py-5" href={`/problem/${problem.id}`}>
          <span className="rounded bg-slate-100 px-2 py-1 text-mono-code text-xs text-slate-600">
            {getProblemCode(problem)}
          </span>
        </Link>
      </td>

      <td className="p-0">
        <Link className="block px-8 py-5" href={`/problem/${problem.id}`}>
          <ProblemTierBadge className="shadow-sm" tier={problem.tier} />
        </Link>
      </td>
    </tr>
  );
}

function PendingCard({ problem }: { problem: PendingProblem }) {
  return (
    <Link
      className="block p-5 transition-colors hover:bg-slate-50/50"
      href={`/problem/${problem.id}`}
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
  );
}

function getProblemCode(problem: PendingProblem) {
  return `${problem.platform}-${problem.problemId}`;
}
