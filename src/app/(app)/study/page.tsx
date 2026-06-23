import { auth } from "@/lib/auth/auth";

import {
  getPendingInvites,
  getUserStudies,
} from "@/services/studies/study.query";
import StudyListHeader from "./_components/study-list-header/study-list-header";
import StudyList from "./_components/study-list/study-list";
import StudyInvites from "./_components/study-invites/study-invites";

export default async function StudyPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [studies, invites] = await Promise.all([
    getUserStudies(userId),
    getPendingInvites(userId),
  ]);

  return (
    <main className="page-shell bg-linear-to-b from-surface to-surface-container-low">
      <div className="page-container grid grid-cols-1 gap-gutter xl:grid-cols-12">
        <section className="space-y-gutter xl:col-span-8">
          <StudyListHeader />
          <StudyList studies={studies} userId={userId} />
        </section>
        <aside className="space-y-gutter xl:sticky xl:top-28 xl:col-span-4 xl:self-start">
          <StudyInvites invites={invites} />
        </aside>
      </div>
    </main>
  );
}
