import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getStudyProblemCount,
  getStudyProblemMemberNames,
  getStudyProblems,
  STUDY_PROBLEM_PAGE_SIZE,
} from "@/server/studies/study.query.service";
import {
  parseStudyProblemFilters,
  parseStudyProblemPage,
} from "@/server/studies/study.schema";
import type {
  StudyProblemInfiniteScrollRequest,
  StudyProblemInfiniteScrollResponse,
  StudyProblemPageSearchParams,
} from "@/types/study";

type StudyProblemApiSearchParams = StudyProblemPageSearchParams & {
  page?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studyId } = await params;
  const memberNames = await getStudyProblemMemberNames({ studyId, userId });

  if (!memberNames) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  const searchParams = createStudyProblemSearchParams(
    request.nextUrl.searchParams,
  );
  const filters = parseStudyProblemFilters(searchParams);
  const query: StudyProblemInfiniteScrollRequest = {
    filters: {
      member: filters.member,
      platform: filters.platform,
      tier: filters.tier,
    },
    page: parseStudyProblemPage(searchParams.page),
    sort: filters.sort,
  };
  const studyProblemFilters = { ...query.filters, sort: query.sort };
  const [problems, totalCount] = await Promise.all([
    getStudyProblems({
      filters: studyProblemFilters,
      page: query.page,
      studyId,
      userId,
    }),
    getStudyProblemCount({
      filters: studyProblemFilters,
      studyId,
      userId,
    }),
  ]);
  const response: StudyProblemInfiniteScrollResponse = {
    currentPage: query.page,
    hasNextPage: query.page * STUDY_PROBLEM_PAGE_SIZE < totalCount,
    items: problems,
    totalCount,
  };

  return Response.json(response);
}

function createStudyProblemSearchParams(
  searchParams: URLSearchParams,
): StudyProblemApiSearchParams {
  return {
    member: searchParams.get("member") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    tier: searchParams.get("tier") ?? undefined,
  };
}
