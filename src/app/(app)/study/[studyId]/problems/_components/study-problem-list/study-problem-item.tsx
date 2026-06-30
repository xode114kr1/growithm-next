import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import type { StudyProblemListItem } from "@/types/study";
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
      className="group absolute left-0 top-0 grid w-full grid-cols-[minmax(0,1fr)_auto] border-b border-slate-50 transition-colors hover:bg-slate-50/80 2xl:grid-cols-[minmax(360px,1.8fr)_minmax(260px,1fr)_180px_160px]"
      data-index={virtualIndex}
      ref={measureElement}
      style={style}
    >
      <td className="col-span-2 min-w-0 px-4 pb-3 pt-4 2xl:col-span-1 2xl:min-w-90 2xl:max-w-140 2xl:px-6 2xl:py-5">
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
      <td className="col-span-2 min-w-0 px-4 pb-4 pt-0 2xl:col-span-1 2xl:px-6 2xl:py-5">
        <ProblemTags categories={problem.categories} />
      </td>
      <td className="px-4 pb-4 pt-0 text-body-sm 2xl:px-6 2xl:py-5">
        <span className="block text-label-caps text-slate-400 2xl:hidden">
          공유한 멤버
        </span>
        <span className="mt-1 block font-semibold text-secondary 2xl:mt-0">
          {problem.sharedBy}
        </span>
      </td>
      <td className="px-4 pb-4 pt-0 text-right text-body-sm text-slate-500 2xl:px-6 2xl:py-5 2xl:text-left">
        <span className="block text-label-caps text-slate-400 2xl:hidden">
          공유일
        </span>
        <span className="mt-1 block 2xl:mt-0">{problem.sharedAtLabel}</span>
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
