import Link from "next/link";

import type { FriendListFilter } from "@/types/friend";

const tabs: { label: string; value: FriendListFilter }[] = [
  { label: "My Friends", value: "friends" },
  { label: "Received Requests", value: "received" },
  { label: "Sent Requests", value: "sent" },
];

export function FriendFilterTabs({
  activeTab,
  searchQuery,
}: {
  activeTab: FriendListFilter;
  searchQuery: string;
}) {
  return (
    <div className="grid rounded-xl bg-slate-100 p-1 sm:grid-cols-3 md:flex md:w-auto">
      {tabs.map((tab) => {
        const params = new URLSearchParams({ tab: tab.value });

        if (searchQuery) {
          params.set("query", searchQuery);
        }

        return (
          <Link
            className={
              activeTab === tab.value
                ? "rounded-lg bg-white px-6 py-2 text-body-sm font-semibold text-teal-900 shadow-sm"
                : "rounded-lg px-6 py-2 text-body-sm font-medium text-slate-500 transition-colors hover:text-teal-800"
            }
            href={`/friend?${params.toString()}`}
            key={tab.value}
            scroll={false}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
