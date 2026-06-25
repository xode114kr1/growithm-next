"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

export default function FriendRequestSection({
  children,
  count,
  title,
}: {
  children: ReactNode;
  count: number;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="app-card overflow-hidden">
      <button
        aria-expanded={isOpen}
        className={`flex w-full cursor-pointer items-center justify-between p-6 text-left ${
          isOpen ? "border-b border-slate-50" : ""
        }`}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        type="button"
      >
        <h2 className="section-title">{title}</h2>
        <div className="flex items-center gap-3">
          {count > 0 ? (
            <span className="rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white">
              {count}
            </span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={`text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            size={20}
          />
        </div>
      </button>
      <div className={isOpen ? "block" : "hidden"}>{children}</div>
    </section>
  );
}
