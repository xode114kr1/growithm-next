import type { StudyListItem } from "@/types/study";

import StudyItem from "./study-item";

export default function StudyList({ studies }: { studies: StudyListItem[] }) {
  return (
    <section>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        {studies.map((study) => (
          <StudyItem key={study.id} study={study} />
        ))}
        {studies.length === 0 ? <EmptyStudyCard /> : null}
      </div>
    </section>
  );
}

function EmptyStudyCard() {
  return (
    <div className="app-card flex min-h-70.5 flex-col justify-center p-6">
      <p className="text-label-caps text-slate-400">참여 중인 스터디 없음</p>
      <h3 className="mt-2 text-base font-bold text-primary">
        참여 중인 스터디가 없습니다.
      </h3>
      <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
        새 스터디를 만들면 이곳에서 바로 확인할 수 있습니다.
      </p>
    </div>
  );
}
