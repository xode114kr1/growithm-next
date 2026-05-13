import { auth } from "@/lib/auth/auth";
import AccountMenu from "@/components/layout/account-menu";
import Navigation from "@/components/layout/navigation";

export default async function Header() {
  const session = await auth();

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-slate-100 bg-white/85 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-container items-center justify-between px-4 sm:px-8 lg:px-10">
        <div className="flex items-center gap-8">
          <Brand />
          <Navigation />
        </div>
        <div className="flex items-center gap-4">
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
