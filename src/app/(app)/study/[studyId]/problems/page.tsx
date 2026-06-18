import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyProblemsData } from "@/services/studies/study.query";

import StudyProblemList from "./_components/study-problem-list";

export default async function StudyProblemsPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const data = userId ? await getStudyProblemsData({ studyId, userId }) : null;

  if (!data) {
    notFound();
  }

  return (
    <StudyProblemList
      memberNames={data.memberNames}
      problems={data.problems}
      tiers={data.tiers}
    />
  );
}
