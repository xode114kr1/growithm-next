"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { usePagination } from "@/hooks/use-pagination";
import type { StudyProblem } from "@/types/study";

import StudyProblemFilters, {
  type StudyProblemSort,
} from "./study-problem-filters";
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
  memberNames,
  problems,
  tiers,
}: {
  memberNames: string[];
  problems: StudyProblem[];
  tiers: string[];
}) {
  const [platformFilter, setPlatformFilter] = useState("All");
  const [selectedProblem, setSelectedProblem] = useState<StudyProblem | null>(
    null,
  );
  const [sharedByFilter, setSharedByFilter] = useState("All");
  const [sort, setSort] = useState<StudyProblemSort>("latest");
  const [tierFilter, setTierFilter] = useState("All");
  const filteredProblems = problems.filter((problem) => {
    const matchesPlatform =
      platformFilter === "All" || problem.platform === platformFilter;
    const matchesTier = tierFilter === "All" || problem.tier === tierFilter;
    const matchesSharedBy =
      sharedByFilter === "All" || problem.sharedBy === sharedByFilter;

    return matchesPlatform && matchesTier && matchesSharedBy;
  });
  const sortedProblems = sortProblems(filteredProblems, sort);
  const { currentPage, endIndex, setCurrentPage, startIndex, totalPages } =
    usePagination({
      itemCount: sortedProblems.length,
      pageSize: PAGE_SIZE,
    });
  const paginatedProblems = sortedProblems.slice(startIndex, endIndex);
  const hasActiveFilters =
    platformFilter !== "All" || tierFilter !== "All" || sharedByFilter !== "All";

  function clearFilters() {
    setPlatformFilter("All");
    setSharedByFilter("All");
    setTierFilter("All");
    setCurrentPage(1);
  }

  return (
    <>
      <StudyProblemFilters
        filteredCount={filteredProblems.length}
        memberNames={memberNames}
        onClearFilters={clearFilters}
        onPlatformChange={(platform) => {
          setPlatformFilter(platform);
          setCurrentPage(1);
        }}
        onSharedByChange={(sharedBy) => {
          setSharedByFilter(sharedBy);
          setCurrentPage(1);
        }}
        onSortChange={(nextSort) => {
          setSort(nextSort);
          setCurrentPage(1);
        }}
        onTierChange={(tier) => {
          setTierFilter(tier);
          setCurrentPage(1);
        }}
        platformFilter={platformFilter}
        sharedByFilter={sharedByFilter}
        sort={sort}
        tiers={tiers}
        tierFilter={tierFilter}
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
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
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
              <button
                className="text-body-sm font-semibold text-secondary hover:underline"
                onClick={clearFilters}
                type="button"
              >
                Clear filters
              </button>
            ) : null}
            <PaginationControls
              currentPage={currentPage}
              onPageChange={setCurrentPage}
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
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="이전 페이지"
        className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={16} />
      </button>
      <span className="px-2 text-body-sm font-semibold text-on-surface">
        {currentPage} / {totalPages}
      </span>
      <button
        aria-label="다음 페이지"
        className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={16} />
      </button>
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  if (hasActiveFilters) {
    return (
      <div className="border-t border-slate-100 px-6 py-14 text-center">
        <p className="font-semibold text-on-surface">조건에 맞는 문제가 없습니다.</p>
        <p className="mt-2 text-body-sm text-slate-500">
          Change or reset the filters to see more shared problems.
        </p>
        <button
          className="btn-secondary mt-5"
          onClick={onClearFilters}
          type="button"
        >
          Clear filters
        </button>
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
