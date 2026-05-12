"use client";

import { Share2, X } from "lucide-react";
import { useActionState, useEffect, useId, useMemo, useState } from "react";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import {
  shareProblemToStudies,
  type ProblemShareActionState,
} from "@/app/(app)/problem/[id]/actions";
import type { ProblemShareTargetStudy } from "@/app/(app)/problem/[id]/_lib/problem-share-targets";

type ProblemShareModalProps = {
  problemId: string;
  problemStatus: ProblemSubmissionStatus;
  studies: ProblemShareTargetStudy[];
};

const initialShareState: ProblemShareActionState = {
  error: null,
  sharedCount: 0,
  skippedCount: 0,
  status: "idle",
};

export default function ProblemShareModal({
  problemId,
  problemStatus,
  studies,
}: ProblemShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudyIds, setSelectedStudyIds] = useState<string[]>([]);
  const [state, formAction, isPending] = useActionState(
    shareProblemToStudies,
    initialShareState,
  );
  const titleId = useId();
  const isShareDisabled = problemStatus !== ProblemSubmissionStatus.COMPLETED;
  const selectedCount = selectedStudyIds.length;
  const selectedLabel = useMemo(
    () =>
      selectedCount === 0
        ? "Select studies"
        : `${selectedCount.toLocaleString()} selected`,
    [selectedCount],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function toggleStudy(studyId: string) {
    setSelectedStudyIds((current) =>
      current.includes(studyId)
        ? current.filter((id) => id !== studyId)
        : [...current, studyId],
    );
  }

  return (
    <>
      <button
        className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isShareDisabled}
        onClick={() => setIsOpen(true)}
        title={
          isShareDisabled
            ? "Write a memo before sharing this problem."
            : "Share this problem to studies"
        }
        type="button"
      >
        <Share2 aria-hidden="true" size={16} />
        Share
      </button>

      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/25 px-4 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <button
            aria-label="Close share modal"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <section className="relative max-h-[calc(100svh-4rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/20">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-label-caps text-slate-400">
                    Share Problem
                  </p>
                  <h2 className="text-h3-ui text-primary" id={titleId}>
                    Select studies
                  </h2>
                </div>
                <button
                  aria-label="Close"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </div>
            </div>

            <form action={formAction} className="space-y-4 px-6 py-6">
              <input name="problemId" type="hidden" value={problemId} />
              {studies.length > 0 ? (
                <div className="space-y-2">
                  {studies.map((study) => {
                    const isSelected = selectedStudyIds.includes(study.id);
                    const isStudyDisabled = study.hasShared || isPending;

                    return (
                      <label
                        className={`flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors ${
                          isStudyDisabled
                            ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-70"
                            : isSelected
                            ? "border-primary bg-secondary-container/40"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                        key={study.id}
                      >
                        <input
                          checked={isSelected}
                          className="size-4 accent-primary"
                          disabled={isStudyDisabled}
                          name="studyIds"
                          onChange={() => toggleStudy(study.id)}
                          value={study.id}
                          type="checkbox"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="block truncate font-semibold text-on-surface">
                              {study.title}
                            </span>
                            {study.hasShared ? (
                              <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                Shared
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 block text-body-sm text-slate-500">
                            {study.ownerName} -{" "}
                            {study.memberCount.toLocaleString()} members -{" "}
                            {study.score.toLocaleString()} XP
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="font-semibold text-on-surface">
                    No studies available
                  </p>
                  <p className="mt-2 text-body-sm text-slate-500">
                    Join or create a study before sharing problems.
                  </p>
                </div>
              )}

              {state.status === "error" ? (
                <p className="rounded-lg bg-error/10 px-4 py-3 text-body-sm font-medium text-error">
                  {state.error}
                </p>
              ) : null}

              {state.status === "success" ? (
                <p className="rounded-lg bg-secondary-container/60 px-4 py-3 text-body-sm font-medium text-primary">
                  Shared to {state.sharedCount.toLocaleString()} studies.
                  {state.skippedCount > 0
                    ? ` ${state.skippedCount.toLocaleString()} were already shared.`
                    : ""}
                </p>
              ) : null}

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                <p className="text-body-sm text-slate-500">{selectedLabel}</p>
                <div className="flex justify-end gap-2">
                  <button
                    className="btn-secondary"
                    onClick={() => setIsOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    disabled={selectedCount === 0 || isPending}
                    type="submit"
                  >
                    {isPending ? "Sharing..." : "Share"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
