import Image from "next/image";
import type { ReactNode } from "react";

import type { FriendProfile } from "@/features/friend/types";

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
    <article
      className={`app-card flex flex-col items-center gap-6 p-6 transition-all hover:border-slate-200 md:flex-row ${
        profile.offline ? "opacity-80 hover:opacity-100" : ""
      }`}
    >
      <button
        aria-label={`${profile.name} profile`}
        className="relative shrink-0 rounded-full outline-none transition-opacity hover:opacity-80 focus:ring-2 focus:ring-primary-container"
        onClick={() => onOpenProfile(profile)}
        type="button"
      >
        <Image
          alt={`${profile.name} avatar`}
          className={`size-16 rounded-full object-cover ring-4 ring-slate-50 ${
            profile.offline ? "grayscale" : ""
          }`}
          height={64}
          src={profile.avatar}
          width={64}
        />
        <span
          className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${
            profile.offline ? "bg-slate-300" : "bg-green-500"
          }`}
        />
      </button>
      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-1 flex flex-col gap-2 md:flex-row md:items-center">
          <h2 className="section-title text-on-background">{profile.name}</h2>
          <span
            className={`mx-auto w-fit rounded-full border px-3 py-0.5 text-2.5 font-bold uppercase tracking-widest md:mx-0 ${profile.tierClass}`}
          >
            {profile.tier}
          </span>
        </div>
      </div>
      {children}
    </article>
  );
}
