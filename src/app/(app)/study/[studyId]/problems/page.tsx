import Link from "next/link";
import StudyLocalNav from "@/app/(app)/study/[studyId]/_components/study-local-nav";

type StudyProblem = {
  categories: string[];
  code: string;
  platform: "BAEKJOON" | "PROGRAMMERS";
  solvedAt: string;
  solvedBy: string;
  state: "Completed" | "Pending";
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Ruby";
  title: string;
};

const study = {
  description: "스터디원들이 함께 풀이한 문제를 모아보는 공간입니다.",
  id: "study-1",
  name: "Algorithm Sprint",
};

const problems: StudyProblem[] = [
  {
    categories: ["DP"],
    code: "PG-43105",
    platform: "PROGRAMMERS",
    solvedAt: "2026-04-24",
    solvedBy: "xode114kr1",
    state: "Completed",
    tier: "Gold",
    title: "정수 삼각형",
  },
  {
    categories: ["Recursion", "Array"],
    code: "PG-68936",
    platform: "PROGRAMMERS",
    solvedAt: "2026-04-22",
    solvedBy: "xode114kr1",
    state: "Completed",
    tier: "Silver",
    title: "쿼드압축 후 개수 세기",
  },
  {
    categories: ["Implementation"],
    code: "PG-155651",
    platform: "PROGRAMMERS",
    solvedAt: "2026-04-20",
    solvedBy: "xode114kr1",
    state: "Completed",
    tier: "Silver",
    title: "호텔 대실",
  },
  {
    categories: ["Graph", "BFS"],
    code: "PG-159993",
    platform: "PROGRAMMERS",
    solvedAt: "2026-04-18",
    solvedBy: "helppy",
    state: "Pending",
    tier: "Gold",
    title: "미로 탈출",
  },
  {
    categories: ["Simulation"],
    code: "PG-160585",
    platform: "PROGRAMMERS",
    solvedAt: "2026-04-17",
    solvedBy: "xode114kr1",
    state: "Completed",
    tier: "Silver",
    title: "혼자서 하는 틱택토",
  },
  {
    categories: ["Math", "Geometry"],
    code: "PG-169198",
    platform: "PROGRAMMERS",
    solvedAt: "2026-04-15",
    solvedBy: "helppy",
    state: "Completed",
    tier: "Gold",
    title: "당구 연습",
  },
];

const tierBadgeClass: Record<StudyProblem["tier"], string> = {
  Bronze: "border-amber-700/20 bg-amber-700 text-white",
  Silver: "border-slate-300 bg-slate-200 text-slate-700",
  Gold: "border-yellow-400/40 bg-yellow-400 text-yellow-950",
  Platinum: "border-cyan-200 bg-primary-fixed text-primary",
  Diamond: "border-sky-300 bg-sky-100 text-sky-800",
  Ruby: "border-rose-300 bg-rose-600 text-white",
};

export default async function StudyProblemsPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;

  return (
    <main className="page-shell">
      <div className="workspace-container">
        <StudyLocalNav active="problems" studyId={studyId} studyName={study.name} />
        <div className="min-w-0 flex-1">
          <StudyProblemsHeading />
          <StudyProblemFilters />
          <StudyProblemTable />
        </div>
      </div>
    </main>
  );
}

function StudyProblemsHeading() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
          <Link className="font-semibold transition-colors hover:text-primary" href="/study">
            Studies
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">{study.name}</span>
          <span>/</span>
          <span>스터디 - 문제 리스트</span>
        </div>
        <h1 className="page-title mb-2">
          Study Problem List
        </h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          {study.description}
        </p>
      </div>
      <label className="flex items-center gap-2">
        <span className="text-body-sm font-medium text-slate-400">Sort by:</span>
        <select className="cursor-pointer border-none bg-transparent text-body-sm font-semibold text-primary outline-none">
          <option>Latest Solved</option>
          <option>Tier (Low-High)</option>
          <option>Tier (High-Low)</option>
          <option>Member</option>
        </select>
      </label>
    </div>
  );
}

function StudyProblemFilters() {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FilterCard title="Platform">
        <div className="flex flex-wrap gap-2">
          {["All", "BAEKJOON", "PROGRAMMERS"].map((platform) => (
            <button
              className={
                platform === "All"
                  ? "rounded-lg border border-primary-container/20 bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container"
                  : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-body-sm font-medium text-slate-600 transition-colors hover:border-primary-container"
              }
              key={platform}
              type="button"
            >
              {platform}
            </button>
          ))}
        </div>
      </FilterCard>
      <FilterCard title="Tier">
        <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20">
          <option>All Tiers</option>
          <option>Ruby</option>
          <option>Diamond</option>
          <option>Platinum</option>
          <option>Gold</option>
          <option>Silver</option>
          <option>Bronze</option>
        </select>
      </FilterCard>
      <FilterCard title="Solved By">
        <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20">
          <option>All Members</option>
          <option>xode114kr1</option>
          <option>helppy</option>
        </select>
      </FilterCard>
      <FilterCard title="Review State">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button className="rounded-md bg-white py-1.5 text-body-sm font-semibold text-primary shadow-sm" type="button">
            All
          </button>
          <button className="rounded-md py-1.5 text-body-sm font-medium text-slate-500 hover:bg-white/50" type="button">
            Pending
          </button>
        </div>
      </FilterCard>
    </section>
  );
}

function StudyProblemTable() {
  return (
    <section className="app-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <TableHead>Problem Details</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Solved By</TableHead>
              <TableHead>Solved At</TableHead>
              <TableHead>State</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {problems.map((problem) => (
              <tr
                className="group transition-colors hover:bg-slate-50/80"
                key={problem.code}
              >
                <td className="min-w-[360px] max-w-[560px] px-6 py-5">
                  <div className="flex items-start gap-4">
                    <span
                      className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-black shadow-sm ${tierBadgeClass[problem.tier]}`}
                    >
                      {problem.tier[0]}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-[11px] text-slate-500">
                          {problem.code}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {problem.platform}
                        </span>
                      </div>
                      <h3 className="text-pretty break-words font-semibold leading-snug text-on-surface transition-colors group-hover:text-secondary">
                        {problem.title}
                      </h3>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.categories.map((tag) => (
                      <span
                        className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-body-sm font-semibold text-secondary">
                  {problem.solvedBy}
                </td>
                <td className="px-6 py-5 text-body-sm text-slate-500">
                  {problem.solvedAt}
                </td>
                <td className="px-6 py-5">
                  <ProblemState state={problem.state} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </section>
  );
}

function ProblemState({ state }: { state: StudyProblem["state"] }) {
  if (state === "Completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed">
        <span aria-hidden="true">✓</span>
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-body-sm font-semibold text-slate-500">
      Pending
    </span>
  );
}

function Pagination() {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
      <p className="text-body-sm text-slate-500">
        Showing <span className="font-semibold text-on-surface">1 - 6</span> of{" "}
        {problems.length} study problems
      </p>
      <div className="flex items-center gap-1">
        <button className="rounded-lg border border-slate-200 p-2 text-slate-300" disabled type="button">
          ‹
        </button>
        <button className="flex size-9 items-center justify-center rounded-lg bg-primary text-body-sm font-semibold text-on-primary" type="button">
          1
        </button>
        <button className="rounded-lg border border-slate-200 p-2 text-slate-300" disabled type="button">
          ›
        </button>
      </div>
    </div>
  );
}

function FilterCard({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <div
      className={`app-card min-w-0 p-4 ${className ?? ""}`}
    >
      <h2 className="mb-3 block text-label-caps text-slate-500">{title}</h2>
      {children}
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>
  );
}
