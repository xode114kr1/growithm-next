import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import StudyProblemModalTable from "@/features/study/components/study-problem-modal-table";
import StudyProblemsHeading from "@/features/study/components/study-problems-heading";
import { getStudyProblemsData } from "@/features/study/server/study-problems-data";

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
    <>
      <StudyProblemsHeading
        description={data.description}
        name={data.name}
        totalCount={data.problems.length}
      />
      <StudyProblemModalTable
        memberNames={data.memberNames}
        problems={data.problems}
        tiers={data.tiers}
      />
    </>
  );
}
