"use client";

import { useState } from "react";

import { ProfileModal } from "@/components/ui/profile-modal";
import type { FriendRequest } from "@/types/friend";

import FriendRequestList from "./friend-request-list";
import FriendRequestSection from "./friend-request-section";

export default function FriendRequests({
  receivedRequests,
  sentRequests,
}: {
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <>
      <aside className="space-y-gutter xl:sticky xl:top-28 xl:col-span-4 xl:col-start-9 xl:row-span-2 xl:row-start-1 xl:self-start">
        <FriendRequestSection
          count={receivedRequests.length}
          title="받은 요청"
        >
          <FriendRequestList
            emptyMessage="받은 친구 요청이 없습니다."
            onOpenProfile={(profile) => setSelectedUserId(profile.id)}
            requests={receivedRequests}
            type="received"
          />
        </FriendRequestSection>
        <FriendRequestSection count={sentRequests.length} title="보낸 요청">
          <FriendRequestList
            emptyMessage="보낸 친구 요청이 없습니다."
            onOpenProfile={(profile) => setSelectedUserId(profile.id)}
            requests={sentRequests}
            type="sent"
          />
        </FriendRequestSection>
      </aside>
      {selectedUserId ? (
        <ProfileModal
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      ) : null}
    </>
  );
}
