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
  searchQuery: initialSearchQuery,
}: {
  friendLists: FriendListMap;
  searchQuery: string;
}) {
  const [activeTab, setActiveTab] = useState<FriendListFilter>("friends");
  const [pendingRequestNames, setPendingRequestNames] = useState<Set<string>>(
    () => new Set(),
  );
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const normalizedSearchQuery = initialSearchQuery.trim();
  const searchResults = friendLists.searchResults;
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
          query={initialSearchQuery}
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
