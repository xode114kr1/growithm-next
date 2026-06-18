import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  getStudyProblemCount,
  getStudyProblemFilterOptions,
  getStudyProblems,
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

  const [problems, totalCount, filterOptions] = await Promise.all([
    getStudyProblems({ studyId, userId }),
    getStudyProblemCount({ studyId, userId }),
    getStudyProblemFilterOptions({ studyId, userId }),
  ]);

  if (!problems || totalCount === null || !filterOptions) {
    notFound();
  }

  const filters = parseStudyProblemFilters({
    memberNames: filterOptions.memberNames,
    params: urlSearchParams,
    tiers: filterOptions.tiers,
  });

  return (
    <StudyProblemList
      filters={filters}
      memberNames={filterOptions.memberNames}
      page={parseStudyProblemPage(urlSearchParams.page)}
      problems={problems}
      queryString={buildStudyProblemQueryString(filters)}
      tiers={filterOptions.tiers}
      totalCount={totalCount}
    />
  );
}
