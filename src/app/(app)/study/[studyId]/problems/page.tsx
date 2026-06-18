import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  getStudyProblemCount,
  getStudyProblemFilterOptions,
  getStudyProblems,
  STUDY_PROBLEM_PAGE_SIZE,
} from "@/services/studies/study.query";

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

  const filterOptions = await getStudyProblemFilterOptions({ studyId, userId });

  if (!filterOptions) {
    notFound();
  }

  const filters = parseStudyProblemFilters({
    memberNames: filterOptions.memberNames,
    params: urlSearchParams,
    tiers: filterOptions.tiers,
  });
  const [filteredCount, totalCount] = await Promise.all([
    getStudyProblemCount({ filters, studyId, userId }),
    getStudyProblemCount({ studyId, userId }),
  ]);
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

  return (
    <StudyProblemList
      currentPage={currentPage}
      filteredCount={filteredCount}
      filters={filters}
      memberNames={filterOptions.memberNames}
      pageSize={STUDY_PROBLEM_PAGE_SIZE}
      problems={problems}
      queryString={buildStudyProblemQueryString(filters)}
      tiers={filterOptions.tiers}
      totalCount={totalCount}
      totalPages={totalPages}
    />
  );
}
