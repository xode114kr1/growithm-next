import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { FriendSearchResult } from "@/types/friend";

import { FriendActionButton } from "../friend-action-buttons";

type SearchResultItemProps = {
  onOpenProfile: (profile: FriendSearchResult) => void;
  onRefreshResults: () => Promise<void>;
  profile: FriendSearchResult;
};

export function SearchResultItem({
  onOpenProfile,
  onRefreshResults,
  profile,
}: SearchResultItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
      <button
        aria-label={`${profile.name} 프로필`}
        className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-80 focus:ring-2 focus:ring-primary-container"
        onClick={() => onOpenProfile(profile)}
        type="button"
      >
        <UserAvatar
          className="ring-2 ring-slate-50"
          image={profile.avatar}
          name={profile.name}
          size="lg"
        />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-body-md font-semibold text-on-background">
          {profile.name}
        </div>
      </div>
      <SearchResultItemActions
        onRefreshResults={onRefreshResults}
        profile={profile}
      />
    </div>
  );
}

function SearchResultItemActions({
  onRefreshResults,
  profile,
}: {
  onRefreshResults: () => Promise<void>;
  profile: FriendSearchResult;
}) {
  if (profile.relationStatus === "friend") {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Button disabled variant="secondary">
          친구
        </Button>
      </div>
    );
  }

  if (profile.relationStatus === "received_request") {
    if (!profile.requestId) return null;

    return (
      <div className="flex shrink-0 items-center gap-2">
        <FriendActionButton
          actionType="reject"
          id={profile.requestId}
          onSuccess={onRefreshResults}
        />
        <FriendActionButton
          actionType="accept"
          id={profile.requestId}
          onSuccess={onRefreshResults}
        />
      </div>
    );
  }

  if (profile.relationStatus === "sent_request") {
    return profile.requestId ? (
      <div className="flex shrink-0 items-center gap-2">
        <FriendActionButton
          actionType="cancel"
          id={profile.requestId}
          onSuccess={onRefreshResults}
        />
      </div>
    ) : (
      <div className="flex shrink-0 items-center gap-2">
        <Button disabled variant="secondary">
          요청 보냄
        </Button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <FriendActionButton
        actionType="send"
        id={profile.id}
        onSuccess={onRefreshResults}
      />
    </div>
  );
}
