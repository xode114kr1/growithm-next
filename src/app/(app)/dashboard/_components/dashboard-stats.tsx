const stats = [
  {
    accent: "bg-secondary-fixed text-on-secondary-container",
    icon: "✓",
    label: "Total Solved",
    meta: "+12% vs last week",
    metaClass: "text-teal-600",
    value: "412",
  },
  {
    accent: "bg-on-primary-fixed-variant text-primary-fixed",
    dark: true,
    icon: "⚑",
    label: "Today's Goal",
    meta: "Target: 3",
    metaClass: "text-on-primary/80",
    value: "2 / 3",
  },
];

export default function DashboardStats() {
  return (
    <>
      {stats.map((stat) => (
        <article
          className={
            stat.dark
              ? "flex flex-col justify-between rounded-3xl bg-primary p-6 text-on-primary shadow-xl shadow-primary/20 md:col-span-4"
              : "flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:col-span-4"
          }
          key={stat.label}
        >
          <div>
            <div className="mb-4 flex items-start justify-between">
              <span
                className={`flex size-10 items-center justify-center rounded-lg text-lg font-bold ${stat.accent}`}
              >
                {stat.icon}
              </span>
              <span className={`text-mono-code text-xs ${stat.metaClass}`}>
                {stat.meta}
              </span>
            </div>
            <h2
              className={
                stat.dark
                  ? "mb-1 text-label-caps text-on-primary/70"
                  : "mb-1 text-label-caps text-slate-500"
              }
            >
              {stat.label}
            </h2>
            <p className="text-h1-editorial">{stat.value}</p>
          </div>
        </article>
      ))}
    </>
  );
}
