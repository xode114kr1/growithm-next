"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type {
  ProblemEmptyStateReason,
  ProblemFiltersState,
  ProblemInfiniteScrollResponse,
  ProblemListItem,
} from "@/types/problem";
import ProblemItem from "./problem-item";

export default function ProblemList({
  emptyStateReason,
  filters,
  initialHasNextPage,
  initialItems,
  totalCount,
}: {
  emptyStateReason: ProblemEmptyStateReason | null;
  filters: ProblemFiltersState;
  initialHasNextPage: boolean;
  initialItems: ProblemListItem[];
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
      const searchParams = createProblemSearchParams(requestedPage, filters);
      const response = await fetch(`/api/problems?${searchParams}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as ProblemInfiniteScrollResponse;

      if (controller.signal.aborted || data.currentPage !== requestedPage) {
        return;
      }

      const nextItems = data.items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));

      setItems((currentItems) => {
        const currentItemIds = new Set(currentItems.map((item) => item.id));
        const uniqueNextItems = nextItems.filter(
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
  }, [filters, hasNextPage, nextPage]);

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
              <TableHead>상태</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((problem) => (
              <ProblemItem problem={problem} key={problem.id} />
            ))}
          </tbody>
        </table>
      </div>
      {emptyStateReason ? <EmptyState reason={emptyStateReason} /> : null}
      {hasNextPage ? (
        <div aria-hidden="true" className="h-px" ref={sentinelRef} />
      ) : null}
      <ListSummary
        isLoading={isLoading}
        showingCount={items.length}
        totalCount={totalCount}
      />
    </section>
  );
}

function ListSummary({
  isLoading,
  showingCount,
  totalCount,
}: {
  isLoading: boolean;
  showingCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
      <p className="text-body-sm text-slate-500">
        전체 {totalCount.toLocaleString()}개 중{" "}
        <span className="font-semibold text-on-surface">{showingCount}개</span>{" "}
        표시
      </p>
      {isLoading ? (
        <p className="text-body-sm text-slate-500">불러오는 중...</p>
      ) : null}
    </div>
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

// 현재 query에 표시할 행이 없을 때 명확한 대체 화면을 보여준다.
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

// 테이블 헤더에 일관된 스타일을 적용한다.
function TableHead({
  children,
  className,
}: {
  children: React.ReactNode;
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
