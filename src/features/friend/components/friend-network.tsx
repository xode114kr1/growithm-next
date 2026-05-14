"use client";

import { useState } from "react";

import { FriendFilterTabs } from "@/features/friend/components/friend-filter-tabs";
import {
  FriendList,
  ReceivedRequestList,
  SentRequestList,
} from "@/features/friend/components/friend-list";
import {
  FriendSearchInput,
  SearchResultList,
} from "@/features/friend/components/friend-search";
import type {
  FriendListFilter,
  FriendListMap,
} from "@/features/friend/types";

export default function FriendNetwork({
  friendLists,
}: {
  friendLists: FriendListMap;
}) {
  const [activeTab, setActiveTab] = useState<FriendListFilter>("friends");
  const [pendingRequestNames, setPendingRequestNames] = useState<Set<string>>(
    () => new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchResults =
    normalizedSearchQuery.length === 0
      ? []
      : friendLists.searchResults.filter((profile) =>
          profile.name.toLowerCase().includes(normalizedSearchQuery),
        );
  const isSearching = normalizedSearchQuery.length > 0;

  function handleAddFriend(profileName: string) {
    setPendingRequestNames((current) => {
      const next = new Set(current);
      next.add(profileName);
      return next;
    });
  }

  return (
    <>
      <section className="mb-8 flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
        <FriendFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <FriendSearchInput
          onQueryChange={setSearchQuery}
          query={searchQuery}
        />
      </section>

      {isSearching ? (
        <SearchResultList
          onAddFriend={handleAddFriend}
          pendingRequestNames={pendingRequestNames}
          query={searchQuery}
          results={searchResults}
        />
      ) : (
        <>
          {activeTab === "friends" && (
            <FriendList friends={friendLists.friends} />
          )}
          {activeTab === "received" && (
            <ReceivedRequestList requests={friendLists.received} />
          )}
          {activeTab === "sent" && (
            <SentRequestList requests={friendLists.sent} />
          )}
        </>
      )}
    </>
  );
}
