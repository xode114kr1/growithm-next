import Link from "next/link";

export default function StudyProblemsHeading({
  description,
  name,
  totalCount,
}: {
  description: string;
  name: string;
  totalCount: number;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
          <Link
            className="font-semibold transition-colors hover:text-primary"
            href="/study"
          >
            Studies
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">{name}</span>
          <span>/</span>
          <span>스터디 - 문제 리스트</span>
        </div>
        <h1 className="page-title mb-2">Study Problem List</h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          {description}
        </p>
      </div>
      <div className="app-card px-5 py-3">
        <p className="text-label-caps text-slate-400">Shared Problems</p>
        <p className="text-h3-ui text-primary">{totalCount.toLocaleString()}</p>
      </div>
    </div>
  );
}
