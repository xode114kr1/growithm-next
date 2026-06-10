import Image from "next/image";
import type { ReactNode } from "react";

import type { FriendProfile } from "@/types/friend";

export function ProfileCard({
  children,
  onOpenProfile,
  profile,
}: {
  children: ReactNode;
  onOpenProfile: (profile: FriendProfile) => void;
  profile: FriendProfile;
}) {
  return (
    <article className="app-card flex flex-col items-center gap-4 p-4 transition-all hover:border-slate-200 md:flex-row md:gap-5">
      <button
        aria-label={`${profile.name} profile`}
        className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-80 focus:ring-2 focus:ring-primary-container"
        onClick={() => onOpenProfile(profile)}
        type="button"
      >
        <Image
          alt={`${profile.name} avatar`}
          className="size-12 rounded-full object-cover ring-2 ring-slate-50 md:size-14"
          height={56}
          src={profile.avatar}
          width={56}
        />
      </button>
      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-1 flex flex-col gap-2 md:flex-row md:items-center">
          <h2 className="text-body-lg font-semibold text-on-background">
            {profile.name}
          </h2>
          <span
            className={`mx-auto w-fit rounded-full border px-2.5 py-0.5 text-2.5 font-bold uppercase tracking-widest md:mx-0 ${profile.tierClass}`}
          >
            {profile.tier}
          </span>
        </div>
      </div>
      {children}
    </article>
  );
}
