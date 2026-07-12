import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import { getProblems } from "@/server/problems/problem.query.service";
import { parseProblemFilters } from "@/server/problems/problem.schema";
import type {
  ProblemInfiniteScrollRequest,
  ProblemInfiniteScrollResponse,
  ProblemPageSearchParams,
} from "@/types/problem";

type ProblemApiSearchParams = ProblemPageSearchParams & {
  cursor?: string;
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
    cursor: params.cursor ?? null,
    sort: filters.sort,
  };
  const problemFilters = { ...query.filters, sort: query.sort };
  const problemPage = await getProblems({
    cursor: query.cursor,
    filters: problemFilters,
    userId,
  });
  const response: ProblemInfiniteScrollResponse = {
    hasNextPage: problemPage.hasNextPage,
    items: problemPage.items.map((problem) => ({
      ...problem,
      createdAt: problem.createdAt.toISOString(),
    })),
    nextCursor: problemPage.nextCursor,
  };

  return Response.json(response);
}

function createProblemSearchParams(
  searchParams: URLSearchParams,
): ProblemApiSearchParams {
  return {
    cursor: searchParams.get("cursor") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    tier: searchParams.get("tier") ?? undefined,
  };
}
