import { ProblemDetail } from "@/types/problem";
import { ReactNode } from "react";

export function ProblemSolutionCode({ code }: { code: string | null }) {
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

export function ProblemMetadata({ problem }: { problem: ProblemDetail }) {
  const metadata = [
    { label: "메모리", value: problem.memory ?? "기록 없음" },
    { label: "실행 시간", value: problem.time ?? "기록 없음" },
    { label: "제출일", value: problem.submittedAtText ?? "제출 완료" },
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item.value),
  );

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {metadata.map((item) => (
          <div className="app-card p-4" key={item.label}>
            <p className="text-label-caps text-slate-400">{item.label}</p>
            <p className="mt-2 wrap-break-word text-body-md font-semibold text-on-surface">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {problem.categories.length > 0 ? (
        <div className="app-card flex flex-wrap gap-2 p-4">
          {problem.categories.map((category) => (
            <span
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-body-sm font-semibold text-slate-600"
              key={category}
            >
              {category}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ProblemDescription({
  description,
}: {
  description: string | null;
}) {
  return (
    <ProblemContentSection title="문제 설명" accent="secondary">
      {description ? (
        <div
          className="problem-description text-body-md text-on-surface-variant"
          // 서버에서 받은 HTML은 운영 환경에서 렌더링 전에 반드시 sanitizing 해야 한다.
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <EmptyContent>저장된 문제 설명이 없습니다.</EmptyContent>
      )}
    </ProblemContentSection>
  );
}

function ProblemContentSection({
  accent,
  children,
  title,
}: {
  accent: "primary" | "secondary";
  children: ReactNode;
  title: string;
}) {
  const accentClass =
    accent === "primary" ? "bg-primary-fixed-dim" : "bg-secondary-fixed-dim";

  return (
    <section className="app-card p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className={`h-8 w-1 rounded-full ${accentClass}`} />
        <h2 className="section-title">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function EmptyContent({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
      {children}
    </div>
  );
}
