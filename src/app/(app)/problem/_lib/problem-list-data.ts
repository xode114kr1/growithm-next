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

// Builds every server-side value needed to render the problem list route.
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

// Chooses the empty state copy based on whether data exists before filtering.
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

// Converts the Prisma JSON categories field into a string list for rendering.
function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}

// Reads the page query and falls back to the first page for invalid values.
function parsePageParam(page: string | string[] | undefined) {
  const value = Array.isArray(page) ? page[0] : page;
  const parsedPage = Number(value);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

// Translates UI filter state into a Prisma where clause.
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

// Translates the selected sort option into a stable Prisma orderBy list.
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

// Normalizes raw URL query params into strongly typed filter state.
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

// Accepts only platform values that exist in the Prisma enum.
function parsePlatformParam(platform: string | string[] | undefined) {
  const value = parseStringParam(platform);

  if (value === ProblemPlatform.BAEKJOON || value === ProblemPlatform.PROGRAMMERS) {
    return value;
  }

  return null;
}

// Extracts the first query param value and trims whitespace.
function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}

// Accepts only supported sort keys and falls back to newest first.
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

// Keeps non-page query params available for pagination links.
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
