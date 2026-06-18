"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { StudyProblem } from "@/types/study";

import type { StudyProblemFilters } from "../types";
import StudyProblemFiltersComponent from "./study-problem-filters";
import StudyProblemItem from "./study-problem-item";
import StudyProblemModal from "./study-problem-modal";

export default function StudyProblemList({
  currentPage,
  filteredCount,
  filters,
  memberNames,
  pageSize,
  problems,
  queryString,
  tiers,
  totalCount,
  totalPages,
}: {
  currentPage: number;
  filteredCount: number;
  filters: StudyProblemFilters;
  memberNames: string[];
  pageSize: number;
  problems: StudyProblem[];
  queryString: string;
  tiers: string[];
  totalCount: number;
  totalPages: number;
}) {
  const [selectedProblem, setSelectedProblem] = useState<StudyProblem | null>(
    null,
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + problems.length;
  const hasActiveFilters =
    filters.platform !== null ||
    filters.tier !== null ||
    filters.member !== null;
  const clearedFiltersQueryString =
    filters.sort === "latest" ? "" : `sort=${filters.sort}`;

  return (
    <>
      <StudyProblemFiltersComponent
        filters={filters}
        filteredCount={filteredCount}
        memberNames={memberNames}
        tiers={tiers}
        totalCount={totalCount}
      />
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
              {problems.map((problem) => (
                <StudyProblemItem
                  key={problem.id}
                  onSelect={setSelectedProblem}
                  problem={problem}
                />
              ))}
            </tbody>
          </table>
        </div>
        {problems.length === 0 ? (
          <EmptyState
            clearFiltersHref={getStudyProblemsHref(
              1,
              clearedFiltersQueryString,
            )}
            hasActiveFilters={hasActiveFilters}
          />
        ) : null}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
          <p className="text-body-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-on-surface">
              {filteredCount > 0 ? startIndex + 1 : "0"} - {endIndex}
            </span>{" "}
            of {filteredCount.toLocaleString()} study problems
          </p>
          <div className="flex items-center gap-2">
            {hasActiveFilters ? (
              <Link
                className="text-body-sm font-semibold text-secondary hover:underline"
                href={getStudyProblemsHref(1, clearedFiltersQueryString)}
              >
                Clear filters
              </Link>
            ) : null}
            <PaginationControls
              currentPage={currentPage}
              queryString={queryString}
              totalPages={totalPages}
            />
          </div>
        </div>
        <StudyProblemModal
          onClose={() => setSelectedProblem(null)}
          onSelectProblem={setSelectedProblem}
          problem={selectedProblem}
          problems={problems}
        />
      </section>
    </>
  );
}

function PaginationControls({
  currentPage,
  queryString,
  totalPages,
}: {
  currentPage: number;
  queryString: string;
  totalPages: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <PaginationLink
        aria-label="이전 페이지"
        disabled={currentPage === 1}
        href={getStudyProblemsHref(currentPage - 1, queryString)}
      >
        <ChevronLeft aria-hidden="true" size={16} />
      </PaginationLink>
      <span className="px-2 text-body-sm font-semibold text-on-surface">
        {currentPage} / {totalPages}
      </span>
      <PaginationLink
        aria-label="다음 페이지"
        disabled={currentPage === totalPages}
        href={getStudyProblemsHref(currentPage + 1, queryString)}
      >
        <ChevronRight aria-hidden="true" size={16} />
      </PaginationLink>
    </div>
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

function PaginationLink({
  children,
  disabled,
  href,
  ...props
}: {
  children: React.ReactNode;
  disabled: boolean;
  href: string;
  "aria-label": string;
}) {
  const className =
    "flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={props["aria-label"]}
        className={`${className} cursor-not-allowed text-slate-300`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      aria-label={props["aria-label"]}
      className={className}
      href={href}
      scroll={false}
    >
      {children}
    </Link>
  );
}

function getStudyProblemsHref(page: number, queryString: string) {
  const params = new URLSearchParams(queryString);

  if (page > 1) {
    params.set("page", String(page));
  }

  const nextQueryString = params.toString();

  return nextQueryString ? `?${nextQueryString}` : "?";
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>
  );
}
