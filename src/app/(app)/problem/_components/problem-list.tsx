"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";

import { useVirtualizedLoadMore } from "@/hooks/use-virtualized-load-more";
import { useWindowVirtualizedList } from "@/hooks/use-window-virtualized-list";
import type {
  ProblemEmptyStateReason,
  ProblemFiltersState,
  ProblemInfiniteScrollResponse,
  ProblemListItem,
} from "@/types/problem";
import ProblemItem from "./problem-item";

const PROBLEM_ROW_ESTIMATE_HEIGHT = 112;
const PROBLEM_LIST_OVERSCAN = 6;
const LOAD_MORE_THRESHOLD = 5;

export default function ProblemList({
  emptyStateReason,
  filters,
  initialHasNextPage,
  initialItems,
}: {
  emptyStateReason: ProblemEmptyStateReason | null;
  filters: ProblemFiltersState;
  initialHasNextPage: boolean;
  initialItems: ProblemListItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [nextPage, setNextPage] = useState(2);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);

  const { containerRef, rowVirtualizer, totalSize, virtualItems } =
    useWindowVirtualizedList<HTMLElement>({
      count: items.length,
      estimateSize: () => PROBLEM_ROW_ESTIMATE_HEIGHT,
      getItemKey: (index) => items[index]?.id ?? index,
      overscan: PROBLEM_LIST_OVERSCAN,
    });

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);

    try {
      const searchParams = createProblemSearchParams(nextPage, filters);
      const response = await fetch(`/api/problems?${searchParams}`);

      if (!response.ok) return;

      const data = (await response.json()) as ProblemInfiniteScrollResponse;

      const nextItems = data.items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));

      setItems((currentItems) => [...currentItems, ...nextItems]);
      setNextPage(data.currentPage + 1);
      setHasNextPage(data.hasNextPage);
    } catch {
      return;
    } finally {
      setIsLoading(false);
    }
  }, [filters, hasNextPage, isLoading, nextPage]);

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
      <div className="overflow-x-auto">
        <table className="grid w-full border-collapse text-left">
          <thead className="grid">
            <tr className="grid grid-cols-[minmax(360px,1.6fr)_minmax(260px,1fr)_180px] border-b border-slate-100 bg-slate-50/50">
              <TableHead>문제 정보</TableHead>
              <TableHead>태그</TableHead>
              <TableHead>상태</TableHead>
            </tr>
          </thead>

          <tbody
            className="relative grid divide-y divide-slate-50"
            style={{
              height: `${totalSize}px`,
            }}
          >
            {virtualItems.map((virtualItem) => {
              const problem = items[virtualItem.index];

              if (!problem) return null;

              return (
                <ProblemItem
                  key={virtualItem.key}
                  measureElement={rowVirtualizer.measureElement}
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

      {emptyStateReason ? <EmptyState reason={emptyStateReason} /> : null}

      {isLoading ? (
        <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-4">
          <p className="text-body-sm text-slate-500">불러오는 중...</p>
        </div>
      ) : null}

      {!hasNextPage && items.length > 0 ? (
        <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-4">
          <p className="text-body-sm text-slate-400">
            모든 문제를 불러왔습니다.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function createProblemSearchParams(page: number, filters: ProblemFiltersState) {
  const searchParams = new URLSearchParams({
    page: String(page),
    sort: filters.sort,
  });

  if (filters.platform) searchParams.set("platform", filters.platform);
  if (filters.q) searchParams.set("q", filters.q);
  if (filters.tier) searchParams.set("tier", filters.tier);

  return searchParams.toString();
}

function EmptyState({ reason }: { reason: ProblemEmptyStateReason }) {
  if (reason === "no-filter-results") {
    return (
      <div className="border-t border-slate-100 px-6 py-14 text-center">
        <p className="font-semibold text-on-surface">
          조건에 맞는 문제가 없습니다.
        </p>
        <p className="mt-2 text-body-sm text-slate-500">
          플랫폼, 티어 또는 검색어를 변경해 보세요.
        </p>
        <Link className="btn-secondary mt-5" href="/problem">
          필터 초기화
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 px-6 py-14 text-center">
      <p className="font-semibold text-on-surface">
        아직 제출한 문제가 없습니다.
      </p>
      <p className="mt-2 text-body-sm text-slate-500">
        웹훅 처리가 완료된 제출 기록이 이곳에 표시됩니다.
      </p>
    </div>
  );
}

function TableHead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-4 text-label-caps text-slate-400 ${className ?? ""}`}
    >
      {children}
    </th>
  );
}
