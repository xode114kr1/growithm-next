import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import type { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import type { StudyProblemListItem } from "@/types/study";
import {
  getProblemStatusBadgeClass,
  getProblemStatusDescription,
  getProblemStatusLabel,
} from "@/utils/problem";
import type { CSSProperties, RefCallback } from "react";

export default function StudyProblemItem({
  measureElement,
  onSelect,
  problem,
  style,
  virtualIndex,
}: {
  measureElement?: RefCallback<HTMLTableRowElement>;
  onSelect: (problem: StudyProblemListItem) => void;
  problem: StudyProblemListItem;
  style?: CSSProperties;
  virtualIndex?: number;
}) {
  return (
    <tr
      className="group absolute left-0 top-0 grid w-full grid-cols-[minmax(360px,1.6fr)_minmax(260px,1fr)_180px_160px_180px] border-b border-slate-50 transition-colors hover:bg-slate-50/80"
      data-index={virtualIndex}
      ref={measureElement}
      style={style}
    >
      <td className="min-w-90 max-w-140 px-6 py-5">
        <button
          className="flex w-full items-start gap-4 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
          onClick={() => onSelect(problem)}
          type="button"
        >
          <span className="min-w-0 space-y-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-2.75 text-slate-500">
                {problem.code}
              </span>
              {problem.tier ? <ProblemTierBadge tier={problem.tier} /> : null}
            </span>
            <span className="block text-pretty wrap-break-word font-semibold leading-snug text-on-surface transition-colors group-hover:text-secondary">
              {problem.title}
            </span>
          </span>
        </button>
      </td>
      <td className="px-6 py-5">
        <ProblemTags categories={problem.categories} />
      </td>
      <td className="px-6 py-5 text-body-sm font-semibold text-secondary">
        {problem.sharedBy}
      </td>
      <td className="px-6 py-5 text-body-sm text-slate-500">
        {problem.sharedAtLabel}
      </td>
      <td className="px-6 py-5">
        <ProblemState status={problem.status} />
      </td>
    </tr>
  );
}

export function ProblemTags({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.length > 0 ? (
        categories.map((tag) => (
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
  );
}

export function ProblemState({ status }: { status: ProblemSubmissionStatus }) {
  return (
    <div className="flex min-w-36 flex-col items-start gap-1.5">
      <span className={getProblemStatusBadgeClass(status)}>
        {getProblemStatusLabel(status)}
      </span>
      <span className="text-body-sm text-slate-500">
        {getProblemStatusDescription(status)}
      </span>
    </div>
  );
}
