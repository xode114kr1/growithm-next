import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import OwnerConsole from "@/features/study/components/owner-console";
import StudyOwnerHeading from "@/features/study/components/study-owner-heading";
import { getStudyOwnerData } from "@/features/study/server/study-owner-data";

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
