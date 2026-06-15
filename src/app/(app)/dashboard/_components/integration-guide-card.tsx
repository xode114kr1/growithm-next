import { BookOpenCheck } from "lucide-react";
import Link from "next/link";

export default function IntegrationGuideCard() {
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
