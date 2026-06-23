import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  getOwnedStudy,
  getOwnedStudyMembers,
  getOwnedStudyPendingInvites,
} from "@/server/studies/study.query";

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

  if (!userId) {
    notFound();
  }

  const study = await getOwnedStudy({ studyId, userId });

  if (!study) {
    notFound();
  }

  const [members, pendingInvites] = await Promise.all([
    getOwnedStudyMembers({ studyId, userId }),
    getOwnedStudyPendingInvites({ studyId, userId }),
  ]);

  if (!members) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <InviteMembersCard
        initialInvites={pendingInvites}
        studyId={study.id}
      />
      <ManageMembersCard members={members} studyId={study.id} />
      <StudySettingsCard study={study} />
      <StudyDeleteCard studyId={study.id} studyName={study.name} />
    </div>
  );
}
