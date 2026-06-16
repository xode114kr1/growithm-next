import type { StudyListItem } from "@/types/study";

import StudyCreateModal from "./study-create-modal";
import StudyItem from "./study-item";

export default async function StudyList({
  userId,
  studies,
}: {
  userId: string | undefined;
  studies: StudyListItem[];
}) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="section-title text-on-surface">참여 중인 스터디</h2>
        <StudyCreateModal />
      </div>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        {studies.map((study) => (
          <StudyItem key={study.id} study={study} />
        ))}
        {studies.length === 0 ? (
          <EmptyStudyCard isSignedIn={Boolean(userId)} />
        ) : null}
        <FindStudyCard />
      </div>
    </section>
  );
}

function EmptyStudyCard({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="app-card flex min-h-70.5 flex-col justify-center p-6">
      <p className="text-label-caps text-slate-400">참여 중인 스터디 없음</p>
      <h3 className="mt-2 text-base font-bold text-primary">
        {isSignedIn ? "참여 중인 스터디가 없습니다." : "로그인이 필요합니다."}
      </h3>
      <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
        {isSignedIn
          ? "새 스터디를 만들면 이곳에서 바로 확인할 수 있습니다."
          : "스터디를 만들거나 참여하려면 먼저 GitHub로 로그인해주세요."}
      </p>
    </div>
  );
}

function FindStudyCard() {
  return (
    <button
      className="flex min-h-70.5 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all hover:border-primary/20 hover:bg-white"
      type="button"
    >
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
        +
      </div>
      <h3 className="mb-1 font-bold text-primary">새 스터디 찾기</h3>
      <p className="max-w-45 text-xs leading-relaxed text-outline">
        내 수준과 목표에 맞는 스터디를 찾아보세요.
      </p>
    </button>
  );
}
