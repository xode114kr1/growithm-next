"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

type StudyLocalNavProps = {
  showOwner?: boolean;
  studyId: string;
  studyName: string;
};

type StudyLocalNavItemId = "overview" | "problems" | "members" | "owner";

export default function StudyLocalNav({
  showOwner = false,
  studyId,
  studyName,
}: StudyLocalNavProps) {
  const segment = useSelectedLayoutSegment();
  const active = getActiveSegment(segment);
  const items: Array<{
    href: string;
    id: StudyLocalNavItemId;
    label: string;
  }> = [
    { href: `/study/${studyId}/overview`, id: "overview", label: "Overview" },
    {
      href: `/study/${studyId}/problems`,
      id: "problems",
      label: "Problem List",
    },
    { href: `/study/${studyId}/members`, id: "members", label: "Members" },
  ];

  if (showOwner) {
    items.push({ href: `/study/${studyId}/owner`, id: "owner", label: "Owner" });
  }

  return (
    <aside className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm lg:sticky lg:top-28 lg:w-64 lg:shrink-0">
      <div className="mb-4 hidden px-2 lg:block">
        <h2 className="truncate text-lg font-black text-primary">
          {studyName}
        </h2>
        <p className="text-label-caps text-slate-400">Active Study Group</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => (
          <Link
            className={
              active === item.id
                ? "whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-on-primary shadow-sm lg:w-full"
                : "whitespace-nowrap rounded-lg px-4 py-2 text-body-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary lg:w-full"
            }
            href={item.href}
            key={item.id}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function getActiveSegment(segment: string | null): StudyLocalNavItemId {
  if (
    segment === "problems" ||
    segment === "members" ||
    segment === "owner"
  ) {
    return segment;
  }

  return "overview";
}
