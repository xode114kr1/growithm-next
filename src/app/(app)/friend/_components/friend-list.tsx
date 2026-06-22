"use client";

import { useState } from "react";

import type { FriendProfile } from "@/types/friend";
import { DeleteFriendButton } from "./friend-action-buttons";
import { FriendItem } from "./friend-item";
import { FriendProfileModal } from "./friend-profile-modal";

export default function FriendList({
  emptyMessage,
  friends,
}: {
  emptyMessage: string;
  friends: FriendProfile[];
}) {
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );

  if (friends.length === 0) {
    return (
      <div className="app-card p-10 text-center text-body-sm text-on-surface-variant">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-4">
        {friends.map((friend) => (
          <FriendItem
            key={friend.id}
            onOpenProfile={setSelectedProfile}
            profile={friend}
          >
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <DeleteFriendButton friendUserId={friend.id} />
              <button
                className="rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
                type="button"
              >
                Invite to Session
              </button>
            </div>
          </FriendItem>
        ))}
      </section>
      {selectedProfile ? (
        <FriendProfileModal
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
