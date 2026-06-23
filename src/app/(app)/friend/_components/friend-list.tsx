"use client";

import { useCallback, useState } from "react";

import { ProfileModal } from "@/components/ui/profile-modal";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getFriendsPage } from "@/server/friends/friend.client";
import type { FriendFiltersState, FriendProfile } from "@/types/friend";
import { FriendActionButton } from "./friend-action-buttons";
import { FriendItem } from "./friend-item";

export default function FriendList({
  filters,
  initialFriends,
  initialHasNextPage,
}: {
  filters: FriendFiltersState;
  initialFriends: FriendProfile[];
  initialHasNextPage: boolean;
}) {
  const [friends, setFriends] = useState(initialFriends);
  const [nextPage, setNextPage] = useState(2);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await getFriendsPage({
        page: nextPage,
        query: filters.query,
      });

      if (!data) {
        return;
      }

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

  return (
    <section className="xl:col-span-8 xl:col-start-1 xl:row-start-2">
      <div className="grid grid-cols-1 gap-4">
        {friends.map((friend) => (
          <FriendItem
            key={friend.id}
            onOpenProfile={(profile) => setSelectedUserId(profile.id)}
            profile={friend}
          >
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <FriendActionButton
                actionType="delete"
                className="w-full"
                id={friend.id}
              />
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
      {friends.length === 0 ? (
        <div className="app-card p-10 text-center text-body-sm text-on-surface-variant">
          친구가 없습니다.
        </div>
      ) : null}
      {selectedUserId ? (
        <ProfileModal
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      ) : null}
    </section>
  );
}
