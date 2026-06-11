"use client";

import { useMemo, useState } from "react";

import type {
  FriendListFilter,
  FriendProfile,
  FriendRequest,
  FriendSearchResult,
} from "@/types/friend";

import { FriendFilterTabs } from "./friend-filter-tabs";
import { FriendListSection } from "./friend-list-section";
import { FriendSearchSection } from "./friend-search-section";

export default function FriendContent({
  friends,
  receivedRequests,
  searchResults,
  sentRequests,
}: {
  friends: FriendProfile[];
  receivedRequests: FriendRequest[];
  searchResults: FriendSearchResult[];
  sentRequests: FriendRequest[];
}) {
  const [activeTab, setActiveTab] = useState<FriendListFilter>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredSearchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return searchResults
      .filter((profile) =>
        profile.name.toLocaleLowerCase().includes(normalizedQuery),
      )
      .slice(0, 12);
  }, [searchQuery, searchResults]);

  return (
    <>
      <section className="mb-8 flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
        <FriendFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <FriendSearchSection
          onSearchQueryChange={setSearchQuery}
          searchQuery={searchQuery}
          searchResults={filteredSearchResults}
        />
      </section>
      <FriendListSection
        activeTab={activeTab}
        friends={friends}
        receivedRequests={receivedRequests}
        sentRequests={sentRequests}
      />
    </>
  );
}
