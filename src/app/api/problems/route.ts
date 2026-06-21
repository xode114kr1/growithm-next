import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getProblemCount,
  getProblems,
  PROBLEM_PAGE_SIZE,
} from "@/services/problems/problem.query";
import {
  parseProblemFilters,
  parseProblemPage,
} from "@/services/problems/problem.validator";
import type {
  ProblemInfiniteScrollRequest,
  ProblemInfiniteScrollResponse,
  ProblemPageSearchParams,
} from "@/types/problem";

type ProblemApiSearchParams = ProblemPageSearchParams & {
  page?: string;
};

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = createProblemSearchParams(request.nextUrl.searchParams);
  const filters = parseProblemFilters(params);
  const query: ProblemInfiniteScrollRequest = {
    filters: {
      platform: filters.platform,
      q: filters.q,
      tier: filters.tier,
    },
    page: parseProblemPage(params.page),
    sort: filters.sort,
  };
  const problemFilters = { ...query.filters, sort: query.sort };
  const [problems, totalCount] = await Promise.all([
    getProblems({
      filters: problemFilters,
      page: query.page,
      userId,
    }),
    getProblemCount(userId, problemFilters),
  ]);
  const response: ProblemInfiniteScrollResponse = {
    currentPage: query.page,
    hasNextPage: query.page * PROBLEM_PAGE_SIZE < totalCount,
    items: problems.map((problem) => ({
      ...problem,
      createdAt: problem.createdAt.toISOString(),
    })),
    totalCount,
  };

  return Response.json(response);
}

function createProblemSearchParams(
  searchParams: URLSearchParams,
): ProblemApiSearchParams {
  return {
    page: searchParams.get("page") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    tier: searchParams.get("tier") ?? undefined,
  };
}
