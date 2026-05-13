import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import StudyOverviewView from "@/features/study/components/study-overview";
import { getStudyOverview } from "@/features/study/server/study-overview-data";

export default async function StudyOverviewPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const study = userId ? await getStudyOverview({ studyId, userId }) : null;

  if (!study) {
    notFound();
  }

  return <StudyOverviewView study={study} />;
}
