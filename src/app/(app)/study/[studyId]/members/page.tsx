import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyMembersData } from "@/services/studies/member.server";

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
  const data = userId ? await getStudyMembersData({ studyId, userId }) : null;

  if (!data) {
    notFound();
  }

  return (
    <>
      <StudyMembersHeading
        memberCount={data.memberCount}
        studyDescription={data.description}
        studyName={data.name}
      />
      <StudyMemberList members={data.members} />
    </>
  );
}
