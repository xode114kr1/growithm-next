"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { useClickOutside } from "@/hooks/use-click-outside";
import type { FriendProfile, FriendSearchResult } from "@/types/friend";

import { FriendProfileModal } from "./friend-profile-modal";
import { FriendSearchInput, SearchResultList } from "./friend-search";

export function FriendSearchSection({
  initialSearchQuery,
  searchResults,
}: {
  initialSearchQuery: string;
  searchResults: FriendSearchResult[];
}) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isSearchPending, startSearchTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextQuery = searchQuery.trim();

      if (nextQuery === initialSearchQuery.trim()) {
        return;
      }

      startSearchTransition(() => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);

        if (nextQuery) {
          nextSearchParams.set("query", nextQuery);
        } else {
          nextSearchParams.delete("query");
        }

        router.replace(`/friend?${nextSearchParams.toString()}`, {
          scroll: false,
        });
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [currentSearchParams, initialSearchQuery, router, searchQuery]);

  function handleAddFriend(profileId: string) {
    setPendingRequestIds((current) => {
      const next = new Set(current);
      next.add(profileId);
      return next;
    });
  }

  function handleSearchQueryChange(query: string) {
    setSearchQuery(query);
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
            isPending={isSearchPending}
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
