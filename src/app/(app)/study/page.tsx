import { auth } from "@/lib/auth/auth";
import StudyInvites from "./_components/study-invites";
import StudyListSection from "./_components/study-list-section";

export default async function StudyPage() {
  const session = await auth();
  const userId = session?.user?.id;
  return (
    <main className="page-shell bg-linear-to-b from-surface to-surface-container-low">
      <div className="page-container grid grid-cols-1 gap-gutter xl:grid-cols-12">
        <StudyListSection userId={userId} />
        <aside className="space-y-gutter xl:sticky xl:top-28 xl:col-span-4 xl:self-start">
          <StudyInvites />
        </aside>
      </div>
    </main>
  );
}
