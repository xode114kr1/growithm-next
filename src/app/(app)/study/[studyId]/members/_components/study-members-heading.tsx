import Link from "next/link";

export default function StudyMembersHeading({
  memberCount,
  studyDescription,
  studyName,
}: {
  memberCount: number;
  studyDescription: string;
  studyName: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
          <Link className="font-semibold transition-colors hover:text-primary" href="/study">
            Studies
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">{studyName}</span>
          <span>/</span>
          <span>스터디 - 멤버</span>
        </div>
        <h1 className="page-title mb-2">
          Study Members
        </h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          {studyDescription}
        </p>
      </div>
      <div className="app-card px-5 py-3">
        <p className="text-label-caps text-slate-400">Members</p>
        <p className="text-h3-ui text-primary">{memberCount}명</p>
      </div>
    </div>
  );
}
