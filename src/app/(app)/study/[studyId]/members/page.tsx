import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  getStudyMembers,
  getStudyMembersSummary,
} from "@/services/studies/study.query";

import StudyMemberList from "./_components/study-member-list";
import StudyMembersHeading from "./_components/study-members-heading";

export default async function StudyMembersPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const summary = userId
    ? await getStudyMembersSummary({ studyId, userId })
    : null;

  if (!summary || !userId) {
    notFound();
  }

  const members = await getStudyMembers({ studyId, userId });

  if (!members) {
    notFound();
  }

  return (
    <>
      <StudyMembersHeading
        memberCount={members.length}
        studyDescription={summary.description}
        studyName={summary.name}
      />
      <StudyMemberList members={members} />
    </>
  );
}
