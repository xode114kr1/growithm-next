import { auth } from "@/lib/auth/auth";
import AccountMenu from "@/components/account-menu";

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

function Navigation() {
  const links = [
    { href: "/dashboard", label: "Home", isActive: true },
    { href: "/problem", label: "Problem" },
    { href: "/study", label: "Study" },
    { href: "/friend", label: "Friend" },
  ];

  return (
    <div className="hidden md:flex gap-6">
      {links.map((link) => (
        <a
          className={
            link.isActive
              ? "border-b-2 border-primary text-body-sm font-semibold text-primary"
              : "text-body-sm font-medium text-slate-500 transition-colors hover:text-primary"
          }
          href={link.href}
          key={link.href || link.label}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
