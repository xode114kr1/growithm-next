import type { FriendListFilter } from "@/types/friend";

const tabs: { label: string; value: FriendListFilter }[] = [
  { label: "내 친구", value: "friends" },
  { label: "받은 요청", value: "received" },
  { label: "보낸 요청", value: "sent" },
];

export function FriendFilterTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: FriendListFilter;
  onTabChange: (tab: FriendListFilter) => void;
}) {
  return (
    <div className="grid rounded-xl bg-slate-100 p-1 sm:grid-cols-3 md:flex md:w-auto">
      {tabs.map((tab) => (
        <button
          className={
            activeTab === tab.value
              ? "rounded-lg bg-white px-6 py-2 text-body-sm font-semibold text-teal-900 shadow-sm"
              : "rounded-lg px-6 py-2 text-body-sm font-medium text-slate-500 transition-colors hover:text-teal-800"
          }
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
