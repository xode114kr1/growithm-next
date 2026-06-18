import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyProblemsData } from "@/services/studies/study.query";

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
  const data = userId ? await getStudyProblemsData({ studyId, userId }) : null;

  if (!data) {
    notFound();
  }

  const filters = parseStudyProblemFilters({
    memberNames: data.memberNames,
    params: urlSearchParams,
    tiers: data.tiers,
  });

  return (
    <StudyProblemList
      filters={filters}
      memberNames={data.memberNames}
      page={parseStudyProblemPage(urlSearchParams.page)}
      problems={data.problems}
      queryString={buildStudyProblemQueryString(filters)}
      tiers={data.tiers}
    />
  );
}
