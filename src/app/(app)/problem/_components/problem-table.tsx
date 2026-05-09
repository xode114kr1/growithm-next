import Link from "next/link";

import type {
  ProblemEmptyStateReason,
  ProblemListItem,
} from "@/app/(app)/problem/_lib/problem-list-types";

export default function ProblemTable({
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
              <TableHead>Problem Details</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>State</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {problems.map((problem) => (
              <tr
                className="group transition-colors hover:bg-slate-50/80"
                key={problem.id}
              >
                <td className="min-w-[360px] max-w-[560px] px-6 py-5">
                  <Link
                    className="flex items-start gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                    href={`/problem/${problem.id}`}
                  >
                    <span
                      className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm ${getTierBadgeClass(problem.tier)}`}
                    >
                      {getPlatformInitial(problem.platform)}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-[11px] text-slate-500">
                          {problem.code}
                        </span>
                        {problem.tier ? (
                          <span className={getTierBadgeClass(problem.tier)}>
                            {problem.tier}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-pretty break-words font-semibold leading-snug text-on-surface transition-colors group-hover:text-secondary">
                        {problem.title}
                      </h3>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.categories.length > 0 ? (
                      problem.categories.map((tag) => (
                        <span
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-body-sm text-slate-400">No tags</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <ProblemState submittedAtText={problem.submittedAtText} />
                </td>
              </tr>
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

// 제출일이 있으면 제출일을 사용해 제출 상태를 표시한다.
function ProblemState({ submittedAtText }: { submittedAtText: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed">
      <span aria-hidden="true">✓</span>
      {submittedAtText ?? "Submitted"}
    </span>
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
        Showing <span className="font-semibold text-on-surface">{start} - {end}</span>{" "}
        of {totalCount.toLocaleString()} problems
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
        <p className="font-semibold text-on-surface">No matching problems</p>
        <p className="mt-2 text-body-sm text-slate-500">
          Adjust the platform, tier, or search text to broaden the result set.
        </p>
        <Link className="btn-secondary mt-5" href="/problem">
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 px-6 py-14 text-center">
      <p className="font-semibold text-on-surface">No problems submitted yet</p>
      <p className="mt-2 text-body-sm text-slate-500">
        Registered submissions will appear here after webhook processing.
      </p>
    </div>
  );
}

// 앞쪽 배지에 표시할 플랫폼 축약 문자를 만든다.
function getPlatformInitial(platform: string) {
  return platform.charAt(0);
}

// tier 텍스트를 가장 가까운 배지 스타일로 매핑한다.
function getTierBadgeClass(tier: string | null) {
  if (tier?.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier?.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  return "badge-tier-silver";
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
    <th className={`px-6 py-4 text-label-caps text-slate-400 ${className ?? ""}`}>
      {children}
    </th>
  );
}
