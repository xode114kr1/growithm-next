import Link from "next/link";

import type { ProblemEmptyStateReason, ProblemListItem } from "@/types/problem";
import ProblemItem from "./problem-item";

export default function ProblemList({
  currentPage,
  emptyStateReason,
  pageSize,
  problems,
  queryString,
  totalCount,
  totalPages,
}: {
  currentPage: number;
  emptyStateReason: ProblemEmptyStateReason | null;
  pageSize: number;
  problems: ProblemListItem[];
  queryString: string;
  totalCount: number;
  totalPages: number;
}) {
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
            {problems.map((problem) => (
              <ProblemItem problem={problem} key={problem.id} />
            ))}
          </tbody>
        </table>
      </div>
      {emptyStateReason ? <EmptyState reason={emptyStateReason} /> : null}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        queryString={queryString}
        showingCount={problems.length}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    </section>
  );
}

// 현재 query 기준의 페이지 이동과 결과 범위 텍스트를 렌더링한다.
function Pagination({
  currentPage,
  pageSize,
  queryString,
  showingCount,
  totalCount,
  totalPages,
}: {
  currentPage: number;
  pageSize: number;
  queryString: string;
  showingCount: number;
  totalCount: number;
  totalPages: number;
}) {
  const start = showingCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min((currentPage - 1) * pageSize + showingCount, totalCount);
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
      <p className="text-body-sm text-slate-500">
        전체 {totalCount.toLocaleString()}개 중{" "}
        <span className="font-semibold text-on-surface">
          {start} - {end}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <PaginationLink
          disabled={currentPage === 1}
          href={getPageHref(currentPage - 1, queryString)}
          label="‹"
        />
        <div className="flex items-center px-2">
          {pages[0] > 1 ? (
            <>
              <PaginationLink href={getPageHref(1, queryString)} label="1" />
              {pages[0] > 2 ? (
                <span className="px-2 text-sm text-slate-400">...</span>
              ) : null}
            </>
          ) : null}
          {pages.map((page) => (
            <Link
              aria-current={page === currentPage ? "page" : undefined}
              className={
                page === currentPage
                  ? "flex size-9 items-center justify-center rounded-lg bg-primary text-body-sm font-semibold text-on-primary"
                  : "flex size-9 items-center justify-center rounded-lg text-body-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              }
              href={getPageHref(page, queryString)}
              key={page}
            >
              {page}
            </Link>
          ))}
          {pages[pages.length - 1] < totalPages ? (
            <>
              {pages[pages.length - 1] < totalPages - 1 ? (
                <span className="px-2 text-sm text-slate-400">...</span>
              ) : null}
              <PaginationLink
                href={getPageHref(totalPages, queryString)}
                label={totalPages}
              />
            </>
          ) : null}
        </div>
        <PaginationLink
          disabled={currentPage === totalPages}
          href={getPageHref(currentPage + 1, queryString)}
          label="›"
        />
      </div>
    </div>
  );
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

// 활성 링크와 비활성 페이지네이션 컨트롤을 같은 크기로 렌더링한다.
function PaginationLink({
  disabled = false,
  href,
  label,
}: {
  disabled?: boolean;
  href: string;
  label: number | string;
}) {
  if (disabled) {
    return (
      <span className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-body-sm font-medium text-slate-300">
        {label}
      </span>
    );
  }

  return (
    <Link
      className="flex size-9 items-center justify-center rounded-lg text-body-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
      href={href}
    >
      {label}
    </Link>
  );
}

// 필터와 정렬 상태를 유지한 페이지네이션 URL을 만든다.
function getPageHref(page: number, queryString: string) {
  const params = new URLSearchParams(queryString);

  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const nextQueryString = params.toString();

  return nextQueryString ? `/problem?${nextQueryString}` : "/problem";
}

// 현재 페이지 주변으로 보이는 페이지 범위를 작게 유지한다.
function getVisiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  const pages = [];

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
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
