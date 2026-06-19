import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyOwnerData } from "@/services/studies/study.query";

import InviteMembersCard from "./_components/invite-members-card";
import ManageMembersCard from "./_components/manage-members-card";
import StudyDeleteCard from "./_components/study-delete-card";
import StudySettingsCard from "./_components/study-settings-card";

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
    <div className="space-y-10">
      <InviteMembersCard
        initialInvites={ownerData.pendingInvites}
        studyId={ownerData.study.id}
      />
      <ManageMembersCard
        members={ownerData.members}
        studyId={ownerData.study.id}
      />
      <StudySettingsCard study={ownerData.study} />
      <StudyDeleteCard
        studyId={ownerData.study.id}
        studyName={ownerData.study.name}
      />
    </div>
  );
}
