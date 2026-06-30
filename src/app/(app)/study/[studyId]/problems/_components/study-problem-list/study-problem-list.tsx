"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { useVirtualizedLoadMore } from "@/hooks/use-virtualized-load-more";
import { useWindowVirtualizedList } from "@/hooks/use-window-virtualized-list";
import type {
  StudyProblemFilters,
  StudyProblemInfiniteScrollResponse,
  StudyProblemListItem,
} from "@/types/study";

import StudyProblemItem from "./study-problem-item";
import StudyProblemModal from "../study-problem-modal";

const STUDY_PROBLEM_ROW_ESTIMATE_HEIGHT = 112;
const STUDY_PROBLEM_LIST_OVERSCAN = 6;
const LOAD_MORE_THRESHOLD = 5;

export default function StudyProblemList({
  clearedFiltersQueryString,
  filters,
  hasActiveFilters,
  initialHasNextPage,
  initialItems,
  studyId,
}: {
  clearedFiltersQueryString: string;
  filters: StudyProblemFilters;
  hasActiveFilters: boolean;
  initialHasNextPage: boolean;
  initialItems: StudyProblemListItem[];
  studyId: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [nextPage, setNextPage] = useState(2);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] =
    useState<StudyProblemListItem | null>(null);

  const { containerRef, rowVirtualizer, totalSize, virtualItems } =
    useWindowVirtualizedList<HTMLElement>({
      count: items.length,
      estimateSize: () => STUDY_PROBLEM_ROW_ESTIMATE_HEIGHT,
      getItemKey: (index) => items[index]?.id ?? index,
      overscan: STUDY_PROBLEM_LIST_OVERSCAN,
    });

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);

    try {
      const searchParams = createStudyProblemSearchParams(nextPage, filters);
      const response = await fetch(
        `/api/studies/${studyId}/problems?${searchParams}`,
      );

      if (!response.ok) return;

      const data =
        (await response.json()) as StudyProblemInfiniteScrollResponse;

      setItems((currentItems) => [...currentItems, ...data.items]);
      setNextPage(data.currentPage + 1);
      setHasNextPage(data.hasNextPage);
    } catch {
      return;
    } finally {
      setIsLoading(false);
    }
  }, [filters, hasNextPage, isLoading, nextPage, studyId]);

  useVirtualizedLoadMore({
    hasNextPage,
    isLoading,
    itemCount: items.length,
    onLoadMore: loadNextPage,
    threshold: LOAD_MORE_THRESHOLD,
    virtualItems,
  });

  return (
    <section className="app-card overflow-hidden" ref={containerRef}>
      <div className="overflow-hidden 2xl:overflow-x-auto">
        <table className="grid w-full border-collapse text-left 2xl:min-w-240">
          <thead className="hidden 2xl:grid">
            <tr className="grid grid-cols-[minmax(360px,1.8fr)_minmax(260px,1fr)_180px_160px] border-b border-slate-100 bg-slate-50/50">
              <TableHead>문제 정보</TableHead>
              <TableHead>태그</TableHead>
              <TableHead>공유한 멤버</TableHead>
              <TableHead>공유일</TableHead>
            </tr>
          </thead>
          <tbody
            className="relative grid divide-y divide-slate-50"
            style={{ height: `${totalSize}px` }}
          >
            {virtualItems.map((virtualItem) => {
              const problem = items[virtualItem.index];

              if (!problem) return null;

              return (
                <StudyProblemItem
                  key={virtualItem.key}
                  measureElement={rowVirtualizer.measureElement}
                  onSelect={setSelectedProblem}
                  problem={problem}
                  style={{
                    transform: `translateY(${
                      virtualItem.start - rowVirtualizer.options.scrollMargin
                    }px)`,
                  }}
                  virtualIndex={virtualItem.index}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {items.length === 0 ? (
        <EmptyState
          clearFiltersHref={getStudyProblemsHref(clearedFiltersQueryString)}
          hasActiveFilters={hasActiveFilters}
        />
      ) : null}
      {hasActiveFilters || isLoading ? (
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/30 px-6 py-4">
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
      ) : null}
      <StudyProblemModal
        onClose={() => setSelectedProblem(null)}
        problem={selectedProblem}
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
        <p className="font-semibold text-on-surface">
          조건에 맞는 문제가 없습니다.
        </p>
        <p className="mt-2 text-body-sm text-slate-500">
          Change or reset the filters to see more shared problems.
        </p>
        <ButtonLink
          className="mt-5"
          href={clearFiltersHref}
          variant="secondary"
        >
          Clear filters
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 px-6 py-14 text-center">
      <p className="font-semibold text-on-surface">
        아직 공유된 문제가 없습니다.
      </p>
      <p className="mt-2 text-body-sm text-slate-500">
        Share a completed submission from your problem detail page to populate
        this study list.
      </p>
      <ButtonLink className="mt-5" href="/problem" variant="secondary">
        Browse Problems
      </ButtonLink>
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
