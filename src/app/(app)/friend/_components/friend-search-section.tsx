"use client";

import { useCallback, useRef, useState } from "react";

import { FriendProfileModal } from "@/components/friend-profile-modal";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { FriendProfile, FriendSearchResult } from "@/types/friend";

import { FriendSearchInput, SearchResultList } from "./friend-search";

export function FriendSearchSection({
  onSearchQueryChange,
  searchQuery,
  searchResults,
}: {
  onSearchQueryChange: (query: string) => void;
  searchQuery: string;
  searchResults: FriendSearchResult[];
}) {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );
  const shouldShowDropdown =
    isDropdownOpen && searchQuery.trim().length > 0;

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  useClickOutside({
    enabled: shouldShowDropdown,
    onClickOutside: closeDropdown,
    ref: searchContainerRef,
  });

  function handleAddFriend(profileId: string) {
    setPendingRequestIds((current) => {
      const next = new Set(current);
      next.add(profileId);
      return next;
    });
  }

  function handleSearchQueryChange(query: string) {
    onSearchQueryChange(query);
    setIsDropdownOpen(query.trim().length > 0);
  }

  return (
    <>
      <div className="relative w-full md:w-96" ref={searchContainerRef}>
        <FriendSearchInput
          onFocus={() => setIsDropdownOpen(searchQuery.trim().length > 0)}
          onQueryChange={handleSearchQueryChange}
          query={searchQuery}
        />
        {shouldShowDropdown ? (
          <SearchResultList
            onAddFriend={handleAddFriend}
            onOpenProfile={(profile) => {
              closeDropdown();
              setSelectedProfile(profile);
            }}
            pendingRequestIds={pendingRequestIds}
            query={searchQuery}
            results={searchResults}
          />
        ) : null}
      </div>
      {selectedProfile ? (
        <FriendProfileModal
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
