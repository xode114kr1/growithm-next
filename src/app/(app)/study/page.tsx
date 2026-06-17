import { auth } from "@/lib/auth/auth";
import StudyListSection from "./_components/study-list-section";
import StudyInviteSection from "./_components/study-invite-section";

export default async function StudyPage() {
  const session = await auth();
  const userId = session?.user?.id;
  return (
    <main className="page-shell bg-linear-to-b from-surface to-surface-container-low">
      <div className="page-container grid grid-cols-1 gap-gutter xl:grid-cols-12">
        <StudyListSection userId={userId} />
        <StudyInviteSection userId={userId} />
      </div>
    </main>
  );
}
