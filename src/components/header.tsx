import { auth } from "@/lib/auth/auth";
import AccountMenu from "@/components/account-menu";
import Navigation from "@/components/navigation";
import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

export default async function Header() {
  const session = await auth();

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-slate-100 bg-white/85 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-container items-center justify-between px-4 sm:px-8 lg:px-10">
        <div className="flex items-center gap-8">
          <Brand />
          <Navigation />
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-body-sm font-semibold text-primary shadow-sm transition-colors hover:border-secondary hover:text-secondary"
            href="/webhook-guide"
          >
            <BookOpenCheck aria-hidden="true" size={18} strokeWidth={2.2} />
            <span className="hidden sm:inline">연동 가이드</span>
          </Link>
          <AccountMenu user={session?.user} />
        </div>
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <span className="font-serif text-2xl font-semibold italic text-primary">
      Growithm
    </span>
  );
}
