import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  getStudyProblemMemberNames,
  getStudyProblems,
} from "@/server/studies/study.query.service";
import { parseStudyProblemFilters } from "@/server/studies/study.schema";
import type {
  StudyProblemInfiniteScrollResponse,
  StudyProblemPageSearchParams,
} from "@/types/study";

type StudyProblemApiSearchParams = StudyProblemPageSearchParams & {
  cursor?: string;
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
  const studyProblemPage = await getStudyProblems({
    cursor: searchParams.cursor ?? null,
    filters,
    studyId,
    userId,
  });
  const response: StudyProblemInfiniteScrollResponse = {
    hasNextPage: studyProblemPage.hasNextPage,
    items: studyProblemPage.items,
    nextCursor: studyProblemPage.nextCursor,
  };

  return Response.json(response);
}

function createStudyProblemSearchParams(
  searchParams: URLSearchParams,
): StudyProblemApiSearchParams {
  return {
    cursor: searchParams.get("cursor") ?? undefined,
    member: searchParams.get("member") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    tier: searchParams.get("tier") ?? undefined,
  };
}
