"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { StudyProblem } from "@/types/study";

import type { StudyProblemFilters, StudyProblemSort } from "../types";
import StudyProblemFiltersComponent from "./study-problem-filters";
import StudyProblemItem from "./study-problem-item";
import StudyProblemModal from "./study-problem-modal";

const PAGE_SIZE = 10;
const tierRank = {
  Ruby: 6,
  Diamond: 5,
  Platinum: 4,
  Gold: 3,
  Silver: 2,
  Bronze: 1,
} as const;

export default function StudyProblemList({
  filters,
  memberNames,
  page,
  problems,
  queryString,
  tiers,
}: {
  filters: StudyProblemFilters;
  memberNames: string[];
  page: number;
  problems: StudyProblem[];
  queryString: string;
  tiers: string[];
}) {
  const [selectedProblem, setSelectedProblem] = useState<StudyProblem | null>(
    null,
  );
  const filteredProblems = problems.filter((problem) => {
    const matchesPlatform =
      filters.platform === null || problem.platform === filters.platform;
    const matchesTier = filters.tier === null || problem.tier === filters.tier;
    const matchesSharedBy =
      filters.member === null || problem.sharedBy === filters.member;

    return matchesPlatform && matchesTier && matchesSharedBy;
  });
  const sortedProblems = sortProblems(filteredProblems, filters.sort);
  const totalPages = Math.max(1, Math.ceil(sortedProblems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedProblems = sortedProblems.slice(startIndex, endIndex);
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
        filteredCount={filteredProblems.length}
        memberNames={memberNames}
        tiers={tiers}
        totalCount={problems.length}
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
              {paginatedProblems.map((problem) => (
                <StudyProblemItem
                  key={problem.id}
                  onSelect={setSelectedProblem}
                  problem={problem}
                />
              ))}
            </tbody>
          </table>
        </div>
        {sortedProblems.length === 0 ? (
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
              {sortedProblems.length > 0 ? startIndex + 1 : "0"} -{" "}
              {Math.min(endIndex, sortedProblems.length)}
            </span>{" "}
            of {sortedProblems.length.toLocaleString()} study problems
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
          problems={sortedProblems}
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

function sortProblems(problems: StudyProblem[], sort: StudyProblemSort) {
  return [...problems].sort((firstProblem, secondProblem) => {
    if (sort === "oldest") {
      return firstProblem.sharedAtTime - secondProblem.sharedAtTime;
    }

    if (sort === "title") {
      return firstProblem.title.localeCompare(secondProblem.title);
    }

    if (sort === "tier") {
      return getTierRank(secondProblem.tier) - getTierRank(firstProblem.tier);
    }

    if (sort === "member") {
      return firstProblem.sharedBy.localeCompare(secondProblem.sharedBy);
    }

    return secondProblem.sharedAtTime - firstProblem.sharedAtTime;
  });
}

function getTierRank(tier: string | null) {
  const normalizedTier = tier?.toLowerCase() ?? "";

  for (const [tierName, rank] of Object.entries(tierRank)) {
    if (normalizedTier.includes(tierName.toLowerCase())) {
      return rank;
    }
  }

  return 0;
}
