import { formatDate } from "@/app/(app)/problem/[id]/_lib/problem-detail-format";
import type { ProblemDetail } from "@/app/(app)/problem/[id]/_lib/problem-detail-types";

export default function ProblemMetadata({ problem }: { problem: ProblemDetail }) {
  const metadata = [
    { label: "Memory", value: problem.memory ?? "기록 없음" },
    { label: "Time", value: problem.time ?? "기록 없음" },
    { label: "Submitted", value: problem.submittedAtText ?? "제출 완료" },
    { label: "Updated", value: formatDate(problem.updatedAt) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {metadata.map((item) => (
          <div className="app-card p-4" key={item.label}>
            <p className="text-label-caps text-slate-400">{item.label}</p>
            <p className="mt-2 break-words text-body-md font-semibold text-on-surface">
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
