import type { ProblemPlatform } from "@/generated/prisma/enums";
import type { DashboardQuickLaunch } from "@/types/dashboard";

const quickLinkStyles: Record<
  ProblemPlatform,
  {
    code: string;
    codeClass: string;
    hoverClass: string;
    label: string;
    url: string;
  }
> = {
  BAEKJOON: {
    code: "BJ",
    codeClass: "bg-teal-50 text-teal-800",
    hoverClass: "group-hover:text-teal-600",
    label: "Baekjoon",
    url: "https://www.acmicpc.net/",
  },
  PROGRAMMERS: {
    code: "PG",
    codeClass: "bg-blue-50 text-blue-800",
    hoverClass: "group-hover:text-blue-600",
    label: "Programmers",
    url: "https://school.programmers.co.kr/learn/challenges",
  },
};

export default function QuickLaunch({
  quickLaunches,
}: {
  quickLaunches: DashboardQuickLaunch[];
}) {
  return (
    <section className="app-card-muted p-6 md:col-span-4">
      <h2 className="mb-6 text-label-caps text-on-primary-fixed-variant">
        Quick Launch
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {quickLaunches.map((quickLaunch) => {
          const link = quickLinkStyles[quickLaunch.platform];

          return (
            <a
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md"
              href={link.url}
              key={quickLaunch.platform}
              rel="noreferrer"
              target="_blank"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${link.codeClass}`}
                >
                  {link.code}
                </span>
                <span>
                  <span className="block text-body-sm font-semibold">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block text-mono-code text-xs text-slate-400">
                    {quickLaunch.problemCount.toLocaleString()} problems
                  </span>
                </span>
              </span>
              <span
                className={`text-lg text-slate-300 transition-colors ${link.hoverClass}`}
                aria-hidden="true"
              >
                ↗
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
