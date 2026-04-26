import { auth } from "@/lib/auth/auth";
import AccountMenu from "@/components/account-menu";

export default async function Header() {
  const session = await auth();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
      <div className="flex items-center gap-8">
        <Brand />
        <Navigation />
      </div>
      <div className="flex items-center gap-4">
        <AccountMenu user={session?.user} />
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <span className="text-2xl font-bold text-teal-900 italic font-h1-editorial">
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
              ? "font-serif text-sm tracking-tight text-teal-900 font-semibold border-b-2 border-teal-900"
              : "font-serif text-sm tracking-tight text-slate-500 hover:text-teal-800 transition-colors"
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
