"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type {
  StudyProblemFilters,
  StudyProblemInfiniteScrollResponse,
  StudyProblemListItem,
} from "@/types/study";

import StudyProblemItem from "./study-problem-item";
import StudyProblemModal from "./study-problem-modal";

export default function StudyProblemList({
  clearedFiltersQueryString,
  filters,
  hasActiveFilters,
  initialHasNextPage,
  initialItems,
  studyId,
  totalCount,
}: {
  clearedFiltersQueryString: string;
  filters: StudyProblemFilters;
  hasActiveFilters: boolean;
  initialHasNextPage: boolean;
  initialItems: StudyProblemListItem[];
  studyId: string;
  totalCount: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [nextPage, setNextPage] = useState(2);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController>(null);
  const isLoadingRef = useRef(false);
  const loadedPagesRef = useRef(new Set([1]));
  const isMountedRef = useRef(false);
  const [selectedProblem, setSelectedProblem] =
    useState<StudyProblemListItem | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const loadNextPage = useCallback(async () => {
    const requestedPage = nextPage;

    if (
      !hasNextPage ||
      isLoadingRef.current ||
      loadedPagesRef.current.has(requestedPage)
    ) {
      return;
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;
    isLoadingRef.current = true;
    loadedPagesRef.current.add(requestedPage);
    setIsLoading(true);

    try {
      const searchParams = createStudyProblemSearchParams(
        requestedPage,
        filters,
      );
      const response = await fetch(
        `/api/studies/${studyId}/problems?${searchParams}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        return;
      }

      const data =
        (await response.json()) as StudyProblemInfiniteScrollResponse;

      if (controller.signal.aborted || data.currentPage !== requestedPage) {
        return;
      }

      setItems((currentItems) => {
        const currentItemIds = new Set(currentItems.map((item) => item.id));
        const uniqueNextItems = data.items.filter(
          (item) => !currentItemIds.has(item.id),
        );

        return [...currentItems, ...uniqueNextItems];
      });
      setNextPage(data.currentPage + 1);
      setHasNextPage(data.hasNextPage);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        isLoadingRef.current = false;

        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }
  }, [filters, hasNextPage, nextPage, studyId]);
  const sentinelRef = useInfiniteScroll({
    enabled: hasNextPage && !isLoading,
    onLoadMore: loadNextPage,
  });

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
              {items.map((problem) => (
                <StudyProblemItem
                  key={problem.id}
                  onSelect={setSelectedProblem}
                  problem={problem}
                />
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 ? (
          <EmptyState
            clearFiltersHref={getStudyProblemsHref(clearedFiltersQueryString)}
            hasActiveFilters={hasActiveFilters}
          />
        ) : null}
        {hasNextPage ? (
          <div aria-hidden="true" className="h-px" ref={sentinelRef} />
        ) : null}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
          <p className="text-body-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-on-surface">
              {items.length}
            </span>{" "}
            of {totalCount.toLocaleString()} study problems
          </p>
          <div className="flex items-center gap-3">
            {hasActiveFilters ? (
              <Link
                className="text-body-sm font-semibold text-secondary hover:underline"
                href={getStudyProblemsHref(clearedFiltersQueryString)}
              >
                Clear filters
              </Link>
            ) : null}
            {isLoading ? (
              <p className="text-body-sm text-slate-500">불러오는 중...</p>
            ) : null}
          </div>
        </div>
        <StudyProblemModal
          onClose={() => setSelectedProblem(null)}
          onSelectProblem={setSelectedProblem}
          problem={selectedProblem}
          problems={items}
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

function createStudyProblemSearchParams(
  page: number,
  filters: StudyProblemFilters,
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    sort: filters.sort,
  });

  if (filters.member) searchParams.set("member", filters.member);
  if (filters.platform) searchParams.set("platform", filters.platform);
  if (filters.tier) searchParams.set("tier", filters.tier);

  return searchParams.toString();
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>
  );
}
