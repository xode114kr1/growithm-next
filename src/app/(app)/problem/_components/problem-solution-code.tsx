export default function ProblemSolutionCode({ code }: { code: string | null }) {
  return (
    <section className="app-card p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-8 w-1 rounded-full bg-primary-fixed-dim" />
        <h2 className="section-title">풀이 코드</h2>
      </div>
      {code ? (
        <pre className="max-h-130 overflow-auto rounded-lg bg-surface-container-low p-4 text-mono-code text-body-sm text-primary">
          <code>{code}</code>
        </pre>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
          저장된 풀이 코드가 없습니다.
        </div>
      )}
    </section>
  );
}
