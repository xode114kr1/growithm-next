import { ProblemPlatform } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  ProblemFiltersState,
  ProblemEmptyStateReason,
  ProblemListItem,
  ProblemPageSearchParams,
  ProblemSort,
} from "./problem-list-types";

const PAGE_SIZE = 25;
const SEARCH_PARAMS_TO_KEEP = ["platform", "tier", "q", "sort"] as const;

// 문제 목록 라우트를 렌더링하는 데 필요한 서버 데이터를 모두 만든다.
export async function getProblemListPageData(params: ProblemPageSearchParams) {
  const filters = parseFilters(params);
  const requestedPage = parsePageParam(params.page);
  const where = buildProblemWhere(filters);
  const orderBy = buildProblemOrderBy(filters.sort);
  const queryString = buildQueryString(params);

  const [availableTiers, unfilteredTotalCount, totalCount] = await Promise.all([
    prisma.problemSubmission.findMany({
      distinct: ["tier"],
      orderBy: {
        tier: "asc",
      },
      select: {
        tier: true,
      },
      where: {
        tier: {
          not: null,
        },
      },
    }),
    prisma.problemSubmission.count(),
    prisma.problemSubmission.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const problemSubmissions = await prisma.problemSubmission.findMany({
    orderBy,
    select: {
      categories: true,
      createdAt: true,
      id: true,
      platform: true,
      problemId: true,
      status: true,
      submittedAtText: true,
      tier: true,
      title: true,
    },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    where,
  });

  const problems: ProblemListItem[] = problemSubmissions.map((problem) => ({
    categories: normalizeCategories(problem.categories),
    code: `${problem.platform}-${problem.problemId}`,
    createdAt: problem.createdAt,
    id: problem.id,
    platform: problem.platform,
    problemId: problem.problemId,
    status: problem.status,
    submittedAtText: problem.submittedAtText,
    tier: problem.tier,
    title: problem.title,
  }));

  return {
    currentPage,
    emptyStateReason: getEmptyStateReason({
      totalCount,
      unfilteredTotalCount,
    }),
    filters,
    pageSize: PAGE_SIZE,
    problems,
    queryString,
    tiers: availableTiers.flatMap((item) => item.tier ?? []),
    totalCount,
    totalPages,
  };
}

// 필터 적용 전 데이터 존재 여부에 따라 빈 상태 문구를 고른다.
function getEmptyStateReason({
  totalCount,
  unfilteredTotalCount,
}: {
  totalCount: number;
  unfilteredTotalCount: number;
}): ProblemEmptyStateReason | null {
  if (totalCount > 0) {
    return null;
  }

  return unfilteredTotalCount > 0 ? "no-filter-results" : "no-submissions";
}

// Prisma JSON categories 필드를 렌더링용 문자열 배열로 변환한다.
function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}

// page query를 읽고 유효하지 않으면 첫 페이지로 대체한다.
function parsePageParam(page: string | string[] | undefined) {
  const value = Array.isArray(page) ? page[0] : page;
  const parsedPage = Number(value);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

// UI 필터 상태를 Prisma where 조건으로 변환한다.
function buildProblemWhere(filters: ProblemFiltersState) {
  const where: Prisma.ProblemSubmissionWhereInput = {};

  if (filters.platform) {
    where.platform = filters.platform;
  }

  if (filters.tier) {
    where.tier = filters.tier;
  }

  if (filters.q) {
    where.OR = [
      {
        title: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
      {
        problemId: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

// 선택한 정렬 옵션을 안정적인 Prisma orderBy 목록으로 변환한다.
function buildProblemOrderBy(sort: ProblemSort) {
  const orderBy: Prisma.ProblemSubmissionOrderByWithRelationInput[] = [];

  if (sort === "oldest") {
    orderBy.push({ createdAt: "asc" });
  } else if (sort === "title") {
    orderBy.push({ title: "asc" });
  } else if (sort === "platform") {
    orderBy.push({ platform: "asc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  orderBy.push({ id: "asc" });

  return orderBy;
}

// URL query 값을 타입이 명확한 필터 상태로 정규화한다.
function parseFilters(params: ProblemPageSearchParams): ProblemFiltersState {
  const platform = parsePlatformParam(params.platform);
  const tier = parseStringParam(params.tier);
  const q = parseStringParam(params.q);
  const sort = parseSortParam(params.sort);

  return {
    platform,
    q,
    sort,
    tier,
  };
}

// Prisma enum에 존재하는 플랫폼 값만 허용한다.
function parsePlatformParam(platform: string | string[] | undefined) {
  const value = parseStringParam(platform);

  if (value === ProblemPlatform.BAEKJOON || value === ProblemPlatform.PROGRAMMERS) {
    return value;
  }

  return null;
}

// 첫 번째 query 값을 꺼내고 앞뒤 공백을 제거한다.
function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}

// 지원하는 정렬 키만 허용하고 기본값은 최신순으로 둔다.
function parseSortParam(sort: string | string[] | undefined): ProblemSort {
  const value = parseStringParam(sort);

  if (
    value === "newest" ||
    value === "oldest" ||
    value === "title" ||
    value === "platform"
  ) {
    return value;
  }

  return "newest";
}

// 페이지네이션 링크에서 page 외 query 값을 유지할 문자열을 만든다.
function buildQueryString(params: ProblemPageSearchParams) {
  const query = new URLSearchParams();

  for (const key of SEARCH_PARAMS_TO_KEEP) {
    const value = params[key];
    const firstValue = Array.isArray(value) ? value[0] : value;

    if (firstValue?.trim()) {
      query.set(key, firstValue.trim());
    }
  }

  return query.toString();
}
