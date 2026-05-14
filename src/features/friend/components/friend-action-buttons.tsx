import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  deleteFriendAction,
  deleteReceivedFriendRequestAction,
  sendFriendRequestAction,
} from "@/features/friend/actions/friend-actions";
import type { FriendSearchResult } from "@/features/friend/types";

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
      <div className="flex shrink-0 items-center gap-2">
        <button
          className="rounded-lg bg-slate-100 px-3 py-2 text-body-sm font-semibold text-slate-500"
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
      <div className="flex shrink-0 items-center gap-2">
        {profile.requestId ? (
          <>
            <DeleteReceivedRequestButton requestId={profile.requestId} />
            <AcceptFriendRequestButton requestId={profile.requestId} />
          </>
        ) : null}
      </div>
    );
  }

  if (profile.relationStatus === "sent_request" || isPending) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        {profile.requestId ? (
          <CancelFriendRequestButton requestId={profile.requestId} />
        ) : (
          <button
            className="rounded-lg bg-slate-100 px-3 py-2 text-body-sm font-semibold text-slate-500"
            disabled
            type="button"
          >
            Request Sent
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <SendFriendRequestButton
        onAddFriend={onAddFriend}
        targetUserId={profile.id}
      />
    </div>
  );
}

export function SendFriendRequestButton({
  onAddFriend,
  targetUserId,
}: {
  onAddFriend?: () => void;
  targetUserId: string;
}) {
  return (
    <form action={sendFriendRequestAction}>
      <input name="targetUserId" type="hidden" value={targetUserId} />
      <button
        className="rounded-lg bg-primary px-3 py-2 text-body-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
        onClick={onAddFriend}
        type="submit"
      >
        Add Friend
      </button>
    </form>
  );
}

export function DeleteFriendButton({ friendUserId }: { friendUserId: string }) {
  return (
    <form action={deleteFriendAction}>
      <input name="friendUserId" type="hidden" value={friendUserId} />
      <button
        className="w-full rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-error"
        type="submit"
      >
        Delete Friend
      </button>
    </form>
  );
}

export function DeleteReceivedRequestButton({
  requestId,
}: {
  requestId: string;
}) {
  return (
    <form action={deleteReceivedFriendRequestAction}>
      <input name="requestId" type="hidden" value={requestId} />
      <button
        className="rounded-lg border border-slate-200 px-3 py-2 text-body-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
        type="submit"
      >
        Delete
      </button>
    </form>
  );
}

export function AcceptFriendRequestButton({ requestId }: { requestId: string }) {
  return (
    <form action={acceptFriendRequestAction}>
      <input name="requestId" type="hidden" value={requestId} />
      <button
        className="rounded-lg bg-primary px-3 py-2 text-body-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
        type="submit"
      >
        Accept
      </button>
    </form>
  );
}

export function CancelFriendRequestButton({
  requestId,
}: {
  requestId: string;
}) {
  return (
    <form action={cancelFriendRequestAction}>
      <input name="requestId" type="hidden" value={requestId} />
      <button
        className="rounded-lg border border-slate-200 px-3 py-2 text-body-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-error"
        type="submit"
      >
        Cancel
      </button>
    </form>
  );
}
