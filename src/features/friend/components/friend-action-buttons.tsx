import type { FriendSearchResult } from "@/features/friend/types";

export function ViewProfileButton() {
  return (
    <button
      className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-teal-900"
      type="button"
    >
      View Profile
    </button>
  );
}

export function SearchResultActions({
  isPending,
  onAddFriend,
  profile,
}: {
  isPending: boolean;
  onAddFriend: () => void;
  profile: FriendSearchResult;
}) {
  if (profile.relationStatus === "friend") {
    return (
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <ViewProfileButton />
        <button
          className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-500"
          disabled
          type="button"
        >
          Friends
        </button>
      </div>
    );
  }

  if (profile.relationStatus === "received_request") {
    return (
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <ViewProfileButton />
        <button
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
          type="button"
        >
          Respond
        </button>
      </div>
    );
  }

  if (profile.relationStatus === "sent_request" || isPending) {
    return (
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <ViewProfileButton />
        <button
          className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-500"
          disabled
          type="button"
        >
          Request Sent
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <ViewProfileButton />
      <button
        className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
        onClick={onAddFriend}
        type="button"
      >
        Add Friend
      </button>
    </div>
  );
}
