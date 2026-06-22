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
      <section className="xl:col-span-8 xl:col-start-1 xl:row-start-2">
        <div className="app-card p-10 text-center text-body-sm text-on-surface-variant">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="xl:col-span-8 xl:col-start-1 xl:row-start-2">
      <div className="grid grid-cols-1 gap-4">
        {friends.map((friend) => (
          <FriendItem
            key={friend.id}
            onOpenProfile={setSelectedProfile}
            profile={friend}
          >
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <DeleteFriendButton friendUserId={friend.id} />
            </div>
          </FriendItem>
        ))}
      </div>
      {selectedProfile ? (
        <FriendProfileModal
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      ) : null}
    </section>
  );
}
