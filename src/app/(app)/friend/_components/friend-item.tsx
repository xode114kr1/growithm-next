import type { ReactNode } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
import type { FriendProfile } from "@/types/friend";

export function FriendItem({
  children,
  compact = false,
  onOpenProfile,
  profile,
}: {
  children: ReactNode;
  compact?: boolean;
  onOpenProfile: (profile: FriendProfile) => void;
  profile: FriendProfile;
}) {
  return (
    <article
      className={
        compact
          ? "flex items-center gap-2.5 p-3"
          : "app-card flex flex-col items-center gap-3 p-4 transition-all hover:border-slate-200 md:flex-row md:gap-4"
      }
    >
      <button
        aria-label={`${profile.name} profile`}
        className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-80 focus:ring-2 focus:ring-primary-container"
        onClick={() => onOpenProfile(profile)}
        type="button"
      >
        <UserAvatar
          className="ring-2 ring-slate-50"
          image={profile.avatar}
          name={profile.name}
          size={compact ? "md" : "lg"}
        />
      </button>
      <div className="min-w-0 flex-1 text-center md:text-left">
        <h2 className="text-body-md font-semibold text-on-background">
          {profile.name}
        </h2>
      </div>
      {children}
    </article>
  );
}
