import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyOverview } from "@/services/studies/study.query";

import {
  ContributionSection,
  RecentSolvedProblems,
  StudyMembersCard,
  StudyOverviewHeader,
  StudyStatsCard,
  StudyTierCard,
} from "./_components/study-overview-ui";

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

  return (
    <div className="space-y-8">
      <StudyOverviewHeader study={study} />
      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-3">
        <StudyTierCard study={study} />
        <StudyStatsCard study={study} />
      </div>
      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-3">
        <ContributionSection contribution={study.contribution} />
        <StudyMembersCard members={study.members} />
      </div>
      <RecentSolvedProblems
        problems={study.recentProblems}
        studyId={study.id}
      />
    </div>
  );
}
