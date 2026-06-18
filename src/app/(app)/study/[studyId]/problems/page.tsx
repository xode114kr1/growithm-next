import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyProblemsData } from "@/services/studies/study.query";

import StudyProblemModalTable from "./_components/study-problem-modal-table";

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
    <StudyProblemModalTable
      memberNames={data.memberNames}
      problems={data.problems}
      tiers={data.tiers}
    />
  );
}
