"use client";

import { useCallback, useState } from "react";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type {
  FriendFiltersState,
  FriendInfiniteScrollResponse,
  FriendProfile,
} from "@/types/friend";
import { DeleteFriendButton } from "./friend-action-buttons";
import { FriendItem } from "./friend-item";
import { FriendProfileModal } from "./friend-profile-modal";

export default function FriendList({
  emptyMessage,
  filters,
  initialFriends,
  initialHasNextPage,
}: {
  emptyMessage: string;
  filters: FriendFiltersState;
  initialFriends: FriendProfile[];
  initialHasNextPage: boolean;
}) {
  const [friends, setFriends] = useState(initialFriends);
  const [nextPage, setNextPage] = useState(2);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: String(nextPage),
      });
      if (filters.query) {
        searchParams.set("query", filters.query);
      }

      const response = await fetch(`/api/friends?${searchParams}`);

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as FriendInfiniteScrollResponse;

      setFriends((currentFriends) => [...currentFriends, ...data.items]);
      setNextPage(data.currentPage + 1);
      setHasNextPage(data.hasNextPage);
    } catch {
      return;
    } finally {
      setIsLoading(false);
    }
  }, [filters.query, hasNextPage, isLoading, nextPage]);

  const sentinelRef = useInfiniteScroll({
    enabled: hasNextPage && !isLoading,
    onLoadMore: loadNextPage,
  });

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
      {hasNextPage ? (
        <div aria-hidden="true" className="h-px" ref={sentinelRef} />
      ) : null}
      {isLoading ? (
        <p className="py-4 text-center text-body-sm text-slate-500">
          불러오는 중...
        </p>
      ) : null}
      {selectedProfile ? (
        <FriendProfileModal
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      ) : null}
    </section>
  );
}
