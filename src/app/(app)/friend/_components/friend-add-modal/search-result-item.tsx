import type { ReactNode } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
import type { FriendSearchResult } from "@/types/friend";

type SearchResultItemProps = {
  children: ReactNode;
  onOpenProfile: (profile: FriendSearchResult) => void;
  profile: FriendSearchResult;
};

export function SearchResultItem({
  children,
  onOpenProfile,
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
      <div className="flex shrink-0 items-center gap-2">
        {children}
      </div>
    </div>
  );
}
