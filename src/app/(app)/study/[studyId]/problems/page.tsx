import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  getStudyProblemCount,
  getStudyProblemFilterOptions,
  getStudyProblems,
  STUDY_PROBLEM_PAGE_SIZE,
} from "@/services/studies/study.query";

import StudyProblemFilters from "./_components/study-problem-filters";
import StudyProblemList from "./_components/study-problem-list";
import {
  buildStudyProblemQueryString,
  parseStudyProblemFilters,
  parseStudyProblemPage,
} from "./_lib/parse";
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
  const [filteredCount, totalCount, filterOptions] = await Promise.all([
    getStudyProblemCount({ filters, studyId, userId }),
    getStudyProblemCount({ studyId, userId }),
    getStudyProblemFilterOptions({ studyId, userId }),
  ]);

  if (!filterOptions) {
    notFound();
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCount / STUDY_PROBLEM_PAGE_SIZE),
  );
  const currentPage = Math.min(
    parseStudyProblemPage(urlSearchParams.page),
    totalPages,
  );
  const problems = await getStudyProblems({
    filters,
    page: currentPage,
    studyId,
    userId,
  });
  const hasActiveFilters =
    filters.platform !== null ||
    filters.tier !== null ||
    filters.member !== null;
  const clearedFiltersQueryString =
    filters.sort === "latest" ? "" : `sort=${filters.sort}`;
  const queryString = buildStudyProblemQueryString(filters);

  return (
    <>
      <StudyProblemFilters
        filters={filters}
        filteredCount={filteredCount}
        memberNames={filterOptions.memberNames}
        tiers={filterOptions.tiers}
        totalCount={totalCount}
      />
      <StudyProblemList
        clearedFiltersQueryString={clearedFiltersQueryString}
        currentPage={currentPage}
        filteredCount={filteredCount}
        hasActiveFilters={hasActiveFilters}
        pageSize={STUDY_PROBLEM_PAGE_SIZE}
        problems={problems}
        queryString={queryString}
        studyId={studyId}
        totalPages={totalPages}
      />
    </>
  );
}
