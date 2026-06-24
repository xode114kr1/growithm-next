import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import type { ProblemListItem } from "@/types/problem";
import {
  getProblemStatusBadgeClass,
  getProblemStatusLabel,
} from "@/utils/problem";
import Link from "next/link";
import type { CSSProperties, RefCallback } from "react";
import ProblemShareScoreBadge from "../problem-share-score-badge";

type ProblemItemProps = {
  currentTime: string;
  measureElement?: RefCallback<HTMLTableRowElement>;
  problem: ProblemListItem;
  style?: CSSProperties;
  virtualIndex?: number;
};

export default function ProblemItem({
  currentTime,
  measureElement,
  problem,
  style,
  virtualIndex,
}: ProblemItemProps) {
  return (
    <tr
      className="group absolute left-0 top-0 grid w-full grid-cols-[minmax(0,1fr)_auto] border-b border-slate-50 transition-colors hover:bg-slate-50/80 md:grid-cols-[minmax(360px,1.6fr)_minmax(260px,1fr)_180px]"
      data-index={virtualIndex}
      ref={measureElement}
      style={style}
    >
      <td className="col-span-2 min-w-0 px-4 pb-3 pt-4 md:col-span-1 md:min-w-90 md:max-w-140 md:px-6 md:py-5">
        <Link
          className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
          href={`/problem/${problem.id}`}
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-2.75 text-slate-500">
                {problem.code}
              </span>
              {problem.tier ? <ProblemTierBadge tier={problem.tier} /> : null}
              <ProblemShareScoreBadge
                currentTime={currentTime}
                status={problem.status}
                submittedAtText={problem.submittedAtText}
              />
            </div>
            <h3 className="text-pretty wrap-break-word font-semibold leading-snug text-on-surface transition-colors group-hover:text-secondary">
              {problem.title}
            </h3>
          </div>
        </Link>
      </td>

      <td className="min-w-0 px-4 pb-4 pt-0 md:px-6 md:py-5">
        <div className="flex flex-wrap gap-1.5">
          {problem.categories.length > 0 ? (
            problem.categories.map((tag) => (
              <span
                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-2.75 font-medium text-slate-500"
                key={tag}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-body-sm text-slate-400">태그 없음</span>
          )}
        </div>
      </td>

      <td className="px-4 pb-4 pt-0 md:px-6 md:py-5">
        <ProblemSubmissionState problem={problem} />
      </td>
    </tr>
  );
}

function ProblemSubmissionState({ problem }: { problem: ProblemListItem }) {
  return (
    <div className="flex min-w-0 justify-end md:block md:min-w-36">
      <span className={getProblemStatusBadgeClass(problem.status)}>
        {getProblemStatusLabel(problem.status)}
      </span>
    </div>
  );
}
