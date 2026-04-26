const quickLinks = [
  {
    code: "BJ",
    codeClass: "bg-teal-50 text-teal-800",
    hoverClass: "group-hover:text-teal-600",
    label: "Baekjoon",
  },
  {
    code: "PG",
    codeClass: "bg-blue-50 text-blue-800",
    hoverClass: "group-hover:text-blue-600",
    label: "Programmers",
  },
];

export default function QuickLaunch() {
  return (
    <section className="rounded-3xl border border-slate-100 bg-surface-container-low p-6 md:col-span-4">
      <h2 className="mb-6 text-label-caps text-on-primary-fixed-variant">
        Quick Launch
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {quickLinks.map((link) => (
          <a
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md"
            href="#"
            key={link.label}
          >
            <span className="flex items-center gap-3">
              <span
                className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${link.codeClass}`}
              >
                {link.code}
              </span>
              <span className="text-sm font-semibold">{link.label}</span>
            </span>
            <span
              className={`text-lg text-slate-300 transition-colors ${link.hoverClass}`}
              aria-hidden="true"
            >
              ↗
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
