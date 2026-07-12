import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  getStudyProblemCount,
  getStudyProblemMemberNames,
  getStudyProblemTiers,
  getStudyProblems,
} from "@/server/studies/study.query.service";
import { parseStudyProblemFilters } from "@/server/studies/study.schema";

import StudyProblemFilters from "./_components/study-problem-filters";
import StudyProblemList from "./_components/study-problem-list/study-problem-list";
import type { StudyProblemPageSearchParams } from "./types";

export default async function StudyProblemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ studyId: string }>;
  searchParams: Promise<StudyProblemPageSearchParams>;
}) {
  const [{ studyId }, urlSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const filters = parseStudyProblemFilters(urlSearchParams);
  const [filteredCount, totalCount, memberNames, tiers, studyProblemPage] =
    await Promise.all([
      getStudyProblemCount({ filters, studyId, userId }),
      getStudyProblemCount({ studyId, userId }),
      getStudyProblemMemberNames({ studyId, userId }),
      getStudyProblemTiers({ studyId, userId }),
      getStudyProblems({
        filters,
        studyId,
        userId,
      }),
    ]);

  if (!memberNames) {
    notFound();
  }

  const hasActiveFilters =
    filters.platform !== null ||
    filters.tier !== null ||
    filters.member !== null;
  const clearedFiltersQueryString =
    filters.sort === "latest" ? "" : `sort=${filters.sort}`;

  return (
    <>
      <StudyProblemFilters
        filters={filters}
        filteredCount={filteredCount}
        memberNames={memberNames}
        tiers={tiers}
        totalCount={totalCount}
      />
      <StudyProblemList
        clearedFiltersQueryString={clearedFiltersQueryString}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        initialHasNextPage={studyProblemPage.hasNextPage}
        initialItems={studyProblemPage.items}
        initialNextCursor={studyProblemPage.nextCursor}
        key={createStudyProblemListKey(filters)}
        studyId={studyId}
      />
    </>
  );
}

function createStudyProblemListKey(filters: {
  member: string | null;
  platform: string | null;
  sort: string;
  tier: string | null;
}) {
  return new URLSearchParams({
    member: filters.member ?? "",
    platform: filters.platform ?? "",
    sort: filters.sort,
    tier: filters.tier ?? "",
  }).toString();
}
