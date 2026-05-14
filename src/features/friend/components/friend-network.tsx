"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { FriendFilterTabs } from "@/features/friend/components/friend-filter-tabs";
import {
  FriendList,
  ReceivedRequestList,
  SentRequestList,
} from "@/features/friend/components/friend-list";
import { FriendProfileModal } from "@/features/friend/components/friend-profile-modal";
import {
  FriendSearchInput,
  SearchResultList,
} from "@/features/friend/components/friend-search";
import type {
  FriendListFilter,
  FriendListMap,
  FriendProfile,
} from "@/features/friend/types";

export default function FriendNetwork({
  friendLists,
  searchQuery: initialSearchQuery,
}: {
  friendLists: FriendListMap;
  searchQuery: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FriendListFilter>("friends");
  const [pendingRequestNames, setPendingRequestNames] = useState<Set<string>>(
    () => new Set(),
  );
  const [isSearchPending, startSearchTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );
  const normalizedSearchQuery = searchQuery.trim();
  const searchResults = friendLists.searchResults;
  const shouldShowSearchDropdown = normalizedSearchQuery.length > 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextQuery = searchQuery.trim();

      if (nextQuery === initialSearchQuery.trim()) {
        return;
      }

      startSearchTransition(() => {
        router.replace(
          nextQuery ? `/friend?query=${encodeURIComponent(nextQuery)}` : "/friend",
          { scroll: false },
        );
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [initialSearchQuery, router, searchQuery]);

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
        <div className="relative w-full md:w-96">
          <FriendSearchInput
            onQueryChange={setSearchQuery}
            query={searchQuery}
          />
          {shouldShowSearchDropdown ? (
            <SearchResultList
              isPending={isSearchPending}
              onAddFriend={handleAddFriend}
              onOpenProfile={setSelectedProfile}
              pendingRequestNames={pendingRequestNames}
              query={searchQuery}
              results={searchResults}
            />
          ) : null}
        </div>
      </section>

      {activeTab === "friends" && (
        <FriendList
          friends={friendLists.friends}
          onOpenProfile={setSelectedProfile}
        />
      )}
      {activeTab === "received" && (
        <ReceivedRequestList
          onOpenProfile={setSelectedProfile}
          requests={friendLists.received}
        />
      )}
      {activeTab === "sent" && (
        <SentRequestList
          onOpenProfile={setSelectedProfile}
          requests={friendLists.sent}
        />
      )}
      {selectedProfile ? (
        <FriendProfileModal
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
