import {
  AcceptFriendRequestButton,
  CancelFriendRequestButton,
  DeleteFriendButton,
  DeleteReceivedRequestButton,
  ViewProfileButton,
} from "@/features/friend/components/friend-action-buttons";
import { ProfileCard } from "@/features/friend/components/friend-profile-card";
import type { FriendProfile, FriendRequest } from "@/features/friend/types";

export function FriendList({ friends }: { friends: FriendProfile[] }) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {friends.map((friend) => (
        <ProfileCard key={friend.name} profile={friend}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ViewProfileButton profileId={friend.id} />
            <DeleteFriendButton friendUserId={friend.id} />
            <button
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              type="button"
            >
              Invite to Session
            </button>
          </div>
        </ProfileCard>
      ))}
      <Pagination summary={`Showing ${friends.length} active connections`} />
    </section>
  );
}

export function ReceivedRequestList({
  requests,
}: {
  requests: FriendRequest[];
}) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {requests.map((request) => (
        <ProfileCard key={request.name} profile={request}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ViewProfileButton profileId={request.id} />
            <DeleteReceivedRequestButton requestId={request.requestId} />
            <AcceptFriendRequestButton requestId={request.requestId} />
          </div>
        </ProfileCard>
      ))}
    </section>
  );
}

export function SentRequestList({ requests }: { requests: FriendRequest[] }) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {requests.map((request) => (
        <ProfileCard key={request.name} profile={request}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ViewProfileButton profileId={request.id} />
            <CancelFriendRequestButton requestId={request.requestId} />
          </div>
        </ProfileCard>
      ))}
    </section>
  );
}

function Pagination({ summary }: { summary: string }) {
  return (
    <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center">
      <div className="text-body-sm text-slate-400">{summary}</div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all hover:text-teal-900"
          type="button"
        >
          Prev
        </button>
        <button
          className="size-10 rounded-lg bg-primary text-body-sm font-semibold text-on-primary"
          type="button"
        >
          1
        </button>
        <button
          className="size-10 rounded-lg text-body-sm font-semibold text-slate-500 hover:bg-slate-50"
          type="button"
        >
          2
        </button>
        <button
          className="size-10 rounded-lg text-body-sm font-semibold text-slate-500 hover:bg-slate-50"
          type="button"
        >
          3
        </button>
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all hover:text-teal-900"
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
