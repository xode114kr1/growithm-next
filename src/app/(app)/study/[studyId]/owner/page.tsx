import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyOwnerData } from "@/services/studies/study.query";

import OwnerConsole from "./_components/owner-console";

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
    <OwnerConsole
      initialInvites={ownerData.pendingInvites}
      members={ownerData.members}
      study={ownerData.study}
    />
  );
}
