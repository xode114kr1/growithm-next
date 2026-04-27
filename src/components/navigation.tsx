"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Network, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const links: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
}> = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/problem", icon: BookOpen, label: "Problem" },
  { href: "/study", icon: Users, label: "Study" },
  { href: "/friend", icon: Network, label: "Friend" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 sm:gap-3">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            aria-label={link.label}
            className={
              isActive
                ? "inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 text-body-sm font-semibold text-on-primary shadow-sm"
                : "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-body-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary"
            }
            href={link.href}
            key={link.href}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
            <span className="nav-label">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
