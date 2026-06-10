"use client";

import { useState } from "react";

import type {
  FriendListFilter,
  FriendProfile,
  FriendRequest,
} from "@/types/friend";

import {
  FriendList,
  ReceivedRequestList,
  SentRequestList,
} from "./friend-list";
import { FriendProfileModal } from "./friend-profile-modal";

export function FriendListSection({
  activeTab,
  friends,
  receivedRequests,
  sentRequests,
}: {
  activeTab: FriendListFilter;
  friends: FriendProfile[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
}) {
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );

  return (
    <>
      {activeTab === "friends" ? (
        <FriendList friends={friends} onOpenProfile={setSelectedProfile} />
      ) : null}
      {activeTab === "received" ? (
        <ReceivedRequestList
          onOpenProfile={setSelectedProfile}
          requests={receivedRequests}
        />
      ) : null}
      {activeTab === "sent" ? (
        <SentRequestList
          onOpenProfile={setSelectedProfile}
          requests={sentRequests}
        />
      ) : null}
      {selectedProfile ? (
        <FriendProfileModal
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
