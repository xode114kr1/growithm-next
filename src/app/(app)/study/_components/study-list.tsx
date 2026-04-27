const studies = [
  {
    active: true,
    icon: "GT",
    iconClass: "bg-primary-fixed text-primary",
    members: "8 Members",
    progress: "68%",
    progressClass: "w-[68%]",
    status: "Active 2m ago",
    statusClass: "text-secondary",
    subtitle: "Target: Platinum Tier",
    title: "Graph Theory Deep Dive",
  },
  {
    icon: "FP",
    iconClass: "bg-secondary-fixed text-secondary",
    members: "12 Members",
    progress: "42 / 75",
    progressClass: "w-[56%]",
    status: "Last active 1h ago",
    statusClass: "text-outline",
    subtitle: "Blind 75 & Grind 169",
    title: "FAANG Interview Prep",
  },
  {
    icon: "IC",
    iconClass: "bg-surface-container text-tertiary",
    members: "5 Members",
    progress: "90%",
    progressClass: "w-[90%]",
    status: "Meeting at 8:00 PM",
    statusClass: "text-secondary",
    subtitle: "Advanced Data Structures",
    title: "ICPC Training Crew",
  },
  {
    icon: "DP",
    iconClass: "bg-primary-fixed text-primary",
    members: "9 Members",
    progress: "35%",
    progressClass: "w-[35%]",
    status: "Active 12m ago",
    statusClass: "text-secondary",
    subtitle: "Dynamic Programming Patterns",
    title: "DP Mastery Circle",
  },
  {
    icon: "SD",
    iconClass: "bg-secondary-fixed text-secondary",
    members: "15 Members",
    progress: "18 / 40",
    progressClass: "w-[45%]",
    status: "Last active 30m ago",
    statusClass: "text-outline",
    subtitle: "Scalable Architecture Practice",
    title: "System Design Sprint",
  },
  {
    icon: "GR",
    iconClass: "bg-surface-container text-tertiary",
    members: "7 Members",
    progress: "74%",
    progressClass: "w-[74%]",
    status: "Meeting tomorrow",
    statusClass: "text-secondary",
    subtitle: "Greedy & Interval Problems",
    title: "Greedy Strategy Lab",
  },
  {
    icon: "BT",
    iconClass: "bg-primary-fixed text-primary",
    members: "6 Members",
    progress: "22 / 50",
    progressClass: "w-[44%]",
    status: "Last active 2h ago",
    statusClass: "text-outline",
    subtitle: "Backtracking and Search",
    title: "Backtracking Workshop",
  },
  {
    icon: "DB",
    iconClass: "bg-secondary-fixed text-secondary",
    members: "11 Members",
    progress: "81%",
    progressClass: "w-[81%]",
    status: "Active now",
    statusClass: "text-secondary",
    subtitle: "SQL, Indexes, Transactions",
    title: "Database Interview Club",
  },
  {
    icon: "OS",
    iconClass: "bg-surface-container text-tertiary",
    members: "10 Members",
    progress: "29%",
    progressClass: "w-[29%]",
    status: "Last active yesterday",
    statusClass: "text-outline",
    subtitle: "Threads, Memory, Scheduling",
    title: "Operating Systems Crew",
  },
  {
    icon: "NW",
    iconClass: "bg-primary-fixed text-primary",
    members: "8 Members",
    progress: "63%",
    progressClass: "w-[63%]",
    status: "Meeting at 9:30 PM",
    statusClass: "text-secondary",
    subtitle: "TCP/IP and Web Protocols",
    title: "Network Fundamentals",
  },
  {
    icon: "TS",
    iconClass: "bg-secondary-fixed text-secondary",
    members: "13 Members",
    progress: "51 / 100",
    progressClass: "w-[51%]",
    status: "Active 5m ago",
    statusClass: "text-secondary",
    subtitle: "TypeScript Coding Practice",
    title: "Frontend Problem Solving",
  },
];

export default function StudyList() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-h3-ui text-on-surface">Participating Studies</h2>
        <button
          className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-on-primary transition-all hover:opacity-90"
          type="button"
        >
          스터디 생성
        </button>
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
      <div className="mb-6 flex items-center gap-4">
        <div
          className={`flex size-12 items-center justify-center rounded-lg text-sm font-black ${study.iconClass}`}
        >
          {study.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-primary">{study.title}</h3>
          <p className="text-body-sm text-outline">{study.subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
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
      </div>
      <div className="mt-6 flex gap-2 border-t border-slate-50 pt-6">
        <button
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-on-primary transition-all hover:opacity-90"
          type="button"
        >
          Enter Room
        </button>
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
