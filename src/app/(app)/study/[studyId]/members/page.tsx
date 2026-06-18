import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  getStudyBasicInfo,
  getStudyMembers,
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
  const study = userId
    ? await getStudyBasicInfo({ studyId, userId })
    : null;

  if (!study || !userId) {
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
        studyDescription={study.description}
        studyName={study.name}
      />
      <StudyMemberList members={members} />
    </>
  );
}
