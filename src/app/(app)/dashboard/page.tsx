import { BookOpenCheck } from "lucide-react";
import Link from "next/link";

import { auth } from "@/lib/auth/auth";

import DashboardContent from "./_components/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="page-shell">
      <div className="page-container">
        <DashboardHeader />
        <DashboardContent userId={session?.user?.id} />
      </div>
    </main>
  );
}

function DashboardHeader() {
  return (
    <header className="page-header flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="page-title">Morning, Developer.</h1>
        <p className="text-body-md text-on-surface-variant">
          Your algorithmic growth is on track for{" "}
          <span className="font-semibold text-secondary">Platinum III</span>{" "}
          this week.
        </p>
      </div>
      <Link
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-body-sm font-semibold text-primary shadow-sm transition-colors hover:border-secondary hover:text-secondary"
        href="/webhook-guide"
      >
        <BookOpenCheck aria-hidden="true" size={18} strokeWidth={2.2} />
        연동 가이드
      </Link>
    </header>
  );
}
