"use client";

import type { ProblemShareTargetStudy } from "@/types/study";

type Props = {
  study: ProblemShareTargetStudy;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (id: string) => void;
};

export default function StudyShareItem({
  study,
  isSelected,
  isDisabled,
  onToggle,
}: Props) {
  return (
    <label
      className={`flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors ${
        isDisabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-70"
          : isSelected
            ? "border-primary bg-secondary-container/40"
            : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        disabled={isDisabled}
        className="size-4 accent-primary"
        value={study.id}
        onChange={() => onToggle(study.id)}
      />

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="block truncate font-semibold text-on-surface">
            {study.title}
          </span>

          {study.hasShared && (
            <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold uppercase text-slate-500">
              Shared
            </span>
          )}
        </span>

        <span className="mt-1 block text-body-sm text-slate-500">
          {study.ownerName} - {study.memberCount.toLocaleString()} members -{" "}
          {study.score.toLocaleString()} XP
        </span>
      </span>
    </label>
  );
}
