import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyMembers } from "@/services/studies/study.query";

import StudyMemberList from "./_components/study-member-list";

export default async function StudyMembersPage({
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

  const members = await getStudyMembers({ studyId, userId });

  if (!members) {
    notFound();
  }

  return <StudyMemberList members={members} />;
}
