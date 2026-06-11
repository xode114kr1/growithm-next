export default function ProblemDescription({
  description,
}: {
  description: string | null;
}) {
  if (!description) {
    return (
      <section className="app-card p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-secondary-fixed-dim" />
          <h2 className="section-title">문제 설명</h2>
        </div>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
          저장된 문제 설명이 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section className="app-card p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-8 w-1 rounded-full bg-secondary-fixed-dim" />
        <h2 className="section-title">문제 설명</h2>
      </div>
      <div
        className="problem-description text-body-md text-on-surface-variant"
        // 서버에서 받은 HTML은 운영 환경에서 렌더링 전에 반드시 sanitizing 해야 한다.
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </section>
  );
}
