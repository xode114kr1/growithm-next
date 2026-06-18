import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  getRecentStudyProblems,
  getStudyContribution,
  getStudyMemberPreviews,
  getStudyStats,
  getStudySummary,
} from "@/services/studies/study.query";

import {
  RecentSolvedProblems,
  StudyMembersCard,
  StudyOverviewHeader,
  StudyStatsCard,
  StudyTierCard,
} from "./_components/study-overview-ui";
import ContributionChart from "./_components/contribution-chart";

export default async function StudyOverviewPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const summary = await getStudySummary({ studyId, userId });

  if (!summary) {
    notFound();
  }

  const [stats, contribution, members, recentProblems] = await Promise.all([
    getStudyStats({ studyId, userId }),
    getStudyContribution({ studyId, userId }),
    getStudyMemberPreviews({ studyId, userId }),
    getRecentStudyProblems({ studyId, userId }),
  ]);

  if (!stats || !contribution || !members) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <StudyOverviewHeader
        description={summary.description}
        name={summary.name}
      />
      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-3">
        <StudyTierCard
          nextTierScore={summary.nextTierScore}
          score={summary.score}
          tier={summary.tier}
        />
        <StudyStatsCard stats={stats} />
      </div>
      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-3">
        <ContributionChart data={contribution} />
        <StudyMembersCard members={members} />
      </div>
      <RecentSolvedProblems
        problems={recentProblems}
        studyId={summary.id}
      />
    </div>
  );
}
