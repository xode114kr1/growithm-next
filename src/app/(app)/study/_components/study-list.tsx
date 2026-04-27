import Link from "next/link";
import StudyCreateModal from "@/app/(app)/study/_components/study-create-modal";

type StudyTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Ruby";

const studies = [
  {
    active: true,
    id: "study-1",
    members: "8 Members",
    progress: "68%",
    progressClass: "w-[68%]",
    status: "Active 2m ago",
    statusClass: "text-secondary",
    subtitle: "Target: Platinum Tier",
    tier: "Platinum",
    title: "Graph Theory Deep Dive",
  },
  {
    id: "study-faang",
    members: "12 Members",
    progress: "42 / 75",
    progressClass: "w-[56%]",
    status: "Last active 1h ago",
    statusClass: "text-outline",
    subtitle: "Blind 75 & Grind 169",
    tier: "Gold",
    title: "FAANG Interview Prep",
  },
  {
    id: "study-icpc",
    members: "5 Members",
    progress: "90%",
    progressClass: "w-[90%]",
    status: "Meeting at 8:00 PM",
    statusClass: "text-secondary",
    subtitle: "Advanced Data Structures",
    tier: "Diamond",
    title: "ICPC Training Crew",
  },
  {
    id: "study-dp",
    members: "9 Members",
    progress: "35%",
    progressClass: "w-[35%]",
    status: "Active 12m ago",
    statusClass: "text-secondary",
    subtitle: "Dynamic Programming Patterns",
    tier: "Silver",
    title: "DP Mastery Circle",
  },
  {
    id: "study-system-design",
    members: "15 Members",
    progress: "18 / 40",
    progressClass: "w-[45%]",
    status: "Last active 30m ago",
    statusClass: "text-outline",
    subtitle: "Scalable Architecture Practice",
    tier: "Platinum",
    title: "System Design Sprint",
  },
  {
    id: "study-greedy",
    members: "7 Members",
    progress: "74%",
    progressClass: "w-[74%]",
    status: "Meeting tomorrow",
    statusClass: "text-secondary",
    subtitle: "Greedy & Interval Problems",
    tier: "Gold",
    title: "Greedy Strategy Lab",
  },
  {
    id: "study-backtracking",
    members: "6 Members",
    progress: "22 / 50",
    progressClass: "w-[44%]",
    status: "Last active 2h ago",
    statusClass: "text-outline",
    subtitle: "Backtracking and Search",
    tier: "Bronze",
    title: "Backtracking Workshop",
  },
  {
    id: "study-database",
    members: "11 Members",
    progress: "81%",
    progressClass: "w-[81%]",
    status: "Active now",
    statusClass: "text-secondary",
    subtitle: "SQL, Indexes, Transactions",
    tier: "Ruby",
    title: "Database Interview Club",
  },
  {
    id: "study-os",
    members: "10 Members",
    progress: "29%",
    progressClass: "w-[29%]",
    status: "Last active yesterday",
    statusClass: "text-outline",
    subtitle: "Threads, Memory, Scheduling",
    tier: "Silver",
    title: "Operating Systems Crew",
  },
  {
    id: "study-network",
    members: "8 Members",
    progress: "63%",
    progressClass: "w-[63%]",
    status: "Meeting at 9:30 PM",
    statusClass: "text-secondary",
    subtitle: "TCP/IP and Web Protocols",
    tier: "Diamond",
    title: "Network Fundamentals",
  },
  {
    id: "study-frontend",
    members: "13 Members",
    progress: "51 / 100",
    progressClass: "w-[51%]",
    status: "Active 5m ago",
    statusClass: "text-secondary",
    subtitle: "TypeScript Coding Practice",
    tier: "Gold",
    title: "Frontend Problem Solving",
  },
] satisfies Array<{
  active?: boolean;
  id: string;
  members: string;
  progress: string;
  progressClass: string;
  status: string;
  statusClass: string;
  subtitle: string;
  tier: StudyTier;
  title: string;
}>;

const tierThumbnails: Record<StudyTier, { className: string; label: string }> = {
  Bronze: {
    className: "border-amber-700/20 bg-amber-700 text-white shadow-amber-900/10",
    label: "B",
  },
  Silver: {
    className: "border-slate-300 bg-slate-200 text-slate-700 shadow-slate-400/10",
    label: "S",
  },
  Gold: {
    className: "border-yellow-400/30 bg-yellow-400 text-yellow-950 shadow-yellow-500/10",
    label: "G",
  },
  Platinum: {
    className: "border-cyan-200 bg-primary-fixed text-primary shadow-cyan-500/10",
    label: "P",
  },
  Diamond: {
    className: "border-sky-300 bg-sky-100 text-sky-800 shadow-sky-500/10",
    label: "D",
  },
  Ruby: {
    className: "border-rose-300 bg-rose-600 text-white shadow-rose-700/10",
    label: "R",
  },
};

export default function StudyList() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-h3-ui text-on-surface">Participating Studies</h2>
        <StudyCreateModal />
      </div>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        {studies.map((study) => (
          <StudyCard key={study.title} study={study} />
        ))}
        <FindStudyCard />
      </div>
    </section>
  );
}

function StudyCard({ study }: { study: (typeof studies)[number] }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/5">
      {study.active ? (
        <div className="absolute right-0 top-0 p-4">
          <span className="rounded-full bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
            Active
          </span>
        </div>
      ) : null}
      <Link
        className="mb-6 flex items-center gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
        href={`/study/${study.id}/overview`}
      >
        <TierThumbnail tier={study.tier} />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-primary">
            {study.title}
          </h3>
          <p className="text-body-sm text-outline">
            {study.subtitle} · {study.tier}
          </p>
        </div>
      </Link>
      <Link
        className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
        href={`/study/${study.id}/overview`}
      >
        <div>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-semibold text-on-surface">
              Curriculum Progress
            </span>
            <span className="text-secondary">{study.progress}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className={`h-full rounded-full bg-secondary ${study.progressClass}`}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xs font-medium text-on-surface-variant">
            {study.members}
          </span>
          <span className={`text-xs font-medium ${study.statusClass}`}>
            {study.status}
          </span>
        </div>
      </Link>
      <div className="mt-6 flex gap-2 border-t border-slate-50 pt-6">
        <Link
          href={`/study/${study.id}/overview`}
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-on-primary transition-all hover:opacity-90"
        >
          Enter Room
        </Link>
        <button
          className="rounded-lg bg-surface-container-low px-3 py-2 text-primary transition-all hover:bg-surface-container"
          type="button"
        >
          More
        </button>
      </div>
    </article>
  );
}

function TierThumbnail({ tier }: { tier: StudyTier }) {
  const thumbnail = tierThumbnails[tier];

  return (
    <div
      aria-label={`${tier} tier`}
      className={`flex size-12 shrink-0 items-center justify-center rounded-lg border text-base font-black shadow-sm ${thumbnail.className}`}
      title={`${tier} tier`}
    >
      {thumbnail.label}
    </div>
  );
}

function FindStudyCard() {
  return (
    <button
      className="flex min-h-[282px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all hover:border-primary/20 hover:bg-white"
      type="button"
    >
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
        +
      </div>
      <h3 className="mb-1 font-bold text-primary">Find New Study</h3>
      <p className="max-w-[180px] text-xs leading-relaxed text-outline">
        Explore the directory to find study labs matching your level.
      </p>
    </button>
  );
}
