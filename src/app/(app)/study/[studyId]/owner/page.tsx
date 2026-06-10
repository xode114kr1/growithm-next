import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyOwnerData } from "@/services/study/owner.server";

import OwnerConsole from "./_components/owner-console";
import StudyOwnerHeading from "./_components/study-owner-heading";

export default async function StudyOwnerPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const ownerData = userId ? await getStudyOwnerData({ studyId, userId }) : null;

  if (!ownerData) {
    notFound();
  }

  return (
    <>
      <StudyOwnerHeading study={ownerData.study} />
      <OwnerConsole
        initialInvites={ownerData.pendingInvites}
        members={ownerData.members}
        study={ownerData.study}
      />
    </>
  );
}
