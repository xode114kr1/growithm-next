"use client";

import Link from "next/link";
import { useState } from "react";

import type { StudyProblemListItem } from "@/types/study";

import StudyProblemItem from "./study-problem-item";
import StudyProblemModal from "./study-problem-modal";

export default function StudyProblemList({
  clearedFiltersQueryString,
  hasActiveFilters,
  initialItems,
  studyId,
  totalCount,
}: {
  clearedFiltersQueryString: string;
  hasActiveFilters: boolean;
  initialHasNextPage: boolean;
  initialItems: StudyProblemListItem[];
  studyId: string;
  totalCount: number;
}) {
  const [selectedProblem, setSelectedProblem] =
    useState<StudyProblemListItem | null>(null);

  return (
    <section className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <TableHead>문제 정보</TableHead>
                <TableHead>태그</TableHead>
                <TableHead>공유한 멤버</TableHead>
                <TableHead>공유일</TableHead>
                <TableHead>상태</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {initialItems.map((problem) => (
                <StudyProblemItem
                  key={problem.id}
                  onSelect={setSelectedProblem}
                  problem={problem}
                />
              ))}
            </tbody>
          </table>
        </div>
        {initialItems.length === 0 ? (
          <EmptyState
            clearFiltersHref={getStudyProblemsHref(clearedFiltersQueryString)}
            hasActiveFilters={hasActiveFilters}
          />
        ) : null}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
          <p className="text-body-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-on-surface">
              {initialItems.length}
            </span>{" "}
            of {totalCount.toLocaleString()} study problems
          </p>
          {hasActiveFilters ? (
            <Link
              className="text-body-sm font-semibold text-secondary hover:underline"
              href={getStudyProblemsHref(clearedFiltersQueryString)}
            >
              Clear filters
            </Link>
          ) : null}
        </div>
        <StudyProblemModal
          onClose={() => setSelectedProblem(null)}
          onSelectProblem={setSelectedProblem}
          problem={selectedProblem}
          problems={initialItems}
          studyId={studyId}
        />
    </section>
  );
}

function EmptyState({
  clearFiltersHref,
  hasActiveFilters,
}: {
  clearFiltersHref: string;
  hasActiveFilters: boolean;
}) {
  if (hasActiveFilters) {
    return (
      <div className="border-t border-slate-100 px-6 py-14 text-center">
        <p className="font-semibold text-on-surface">조건에 맞는 문제가 없습니다.</p>
        <p className="mt-2 text-body-sm text-slate-500">
          Change or reset the filters to see more shared problems.
        </p>
        <Link className="btn-secondary mt-5" href={clearFiltersHref}>
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 px-6 py-14 text-center">
      <p className="font-semibold text-on-surface">아직 공유된 문제가 없습니다.</p>
      <p className="mt-2 text-body-sm text-slate-500">
        Share a completed submission from your problem detail page to populate
        this study list.
      </p>
      <Link className="btn-secondary mt-5" href="/problem">
        Browse Problems
      </Link>
    </div>
  );
}

function getStudyProblemsHref(queryString: string) {
  return queryString ? `?${queryString}` : "?";
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>
  );
}
