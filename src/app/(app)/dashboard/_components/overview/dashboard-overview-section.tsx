import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { UserPersonalTier } from "@/types/user";

import { quickLinks } from "../../constants";
import PersonalTierCard from "./personal-tier-card";

export default function DashboardOverviewSection({
  personalTier,
}: {
  personalTier: UserPersonalTier;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <PersonalTierCard personalTier={personalTier} />
      <IntegrationGuideCard />
      <QuickLaunchCard />
    </section>
  );
}

function IntegrationGuideCard() {
  return (
    <Link
      className="app-card group flex flex-col justify-between p-6 transition-all hover:border-secondary hover:shadow-md md:col-span-4"
      href="/webhook-guide"
    >
      <div>
        <div className="mb-4 flex items-start justify-between">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary-container text-secondary">
            <BookOpenCheck aria-hidden="true" size={20} strokeWidth={2.4} />
          </span>
          <span
            aria-hidden="true"
            className="text-lg text-slate-300 transition-colors group-hover:text-secondary"
          >
            →
          </span>
        </div>
        <h2 className="mb-1 text-label-caps text-slate-500">GitHub 연동</h2>
        <p className="font-serif text-7 font-semibold leading-tight text-primary">
          연동 가이드
        </p>
      </div>
      <p className="mt-6 text-body-sm text-on-surface-variant">
        풀이 저장소를 연결하고 제출 기록을 자동으로 관리하세요.
      </p>
    </Link>
  );
}

function QuickLaunchCard() {
  return (
    <section className="app-card-muted p-6 md:col-span-4">
      <h2 className="mb-6 text-label-caps text-on-primary-fixed-variant">
        바로가기
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {quickLinks.map((link) => (
          <a
            className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md"
            href={link.url}
            key={link.code}
            rel="noreferrer"
            target="_blank"
          >
            <span className="flex items-center gap-3">
              <span
                className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${link.codeClass}`}
              >
                {link.code}
              </span>

              <span className="block text-body-sm font-semibold">
                {link.label}
              </span>
            </span>

            <span
              aria-hidden="true"
              className={`text-lg text-slate-300 transition-colors ${link.hoverClass}`}
            >
              ↗
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
