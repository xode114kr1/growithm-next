const platforms = ["All", "BAEKJOON", "PROGRAMMERS"];

export default function ProblemFilters() {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <FilterCard title="Platform">
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              className={
                platform === "All"
                  ? "rounded-lg border border-primary-container/20 bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container"
                  : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-body-sm font-medium text-slate-600 transition-colors hover:border-primary-container"
              }
              key={platform}
            >
              {platform}
            </button>
          ))}
        </div>
      </FilterCard>
      <FilterCard title="Difficulty Tier">
        <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20">
          <option>All Tiers</option>
          <option>Diamond</option>
          <option>Platinum</option>
          <option>Gold</option>
          <option>Silver</option>
          <option>Bronze</option>
        </select>
      </FilterCard>
      <FilterCard className="md:col-span-2 xl:col-span-1" title="Your Progress">
        <div className="grid grid-cols-1 gap-1 rounded-lg bg-slate-100 p-1 sm:grid-cols-3">
          <button className="rounded-md bg-white py-1.5 text-body-sm font-semibold text-primary shadow-sm">
            All
          </button>
          <button className="rounded-md py-1.5 text-body-sm font-medium text-slate-500 hover:bg-white/50">
            Pending
          </button>
          <button className="rounded-md py-1.5 text-body-sm font-medium text-slate-500 hover:bg-white/50">
            Completed
          </button>
        </div>
      </FilterCard>
    </section>
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
