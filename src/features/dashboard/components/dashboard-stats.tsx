const stats = [
  {
    accent: "bg-secondary-fixed text-on-secondary-container",
    icon: "✓",
    label: "Total Solved",
    meta: "+12% vs last week",
    metaClass: "text-teal-600",
    value: "412",
  },
];

export default function DashboardStats() {
  return (
    <>
      {stats.map((stat) => (
        <article
          className="app-card flex flex-col justify-between p-6 md:col-span-4"
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
            <h2 className="mb-1 text-label-caps text-slate-500">{stat.label}</h2>
            <p className="font-serif text-8 font-semibold leading-tight">
              {stat.value}
            </p>
          </div>
        </article>
      ))}
    </>
  );
}
