import StudyFab from "@/features/study/components/study-fab";
import StudyHeader from "@/features/study/components/study-header";
import StudyInvites from "@/features/study/components/study-invites";
import StudyList from "@/features/study/components/study-list";

export default function StudyPage() {
  return (
    <main className="page-shell bg-gradient-to-b from-surface to-surface-container-low">
      <div className="page-container">
        <StudyHeader />
        <div className="grid grid-cols-1 gap-gutter xl:grid-cols-12">
          <div className="space-y-gutter xl:col-span-8">
            <StudyList />
          </div>
          <aside className="space-y-gutter xl:sticky xl:top-28 xl:col-span-4 xl:self-start">
            <StudyInvites />
          </aside>
        </div>
      </div>
      <StudyFab />
    </main>
  );
}
