import { auth } from "@/lib/auth/auth";
import {
  FRIEND_PAGE_SIZE,
  getFriendCount,
  getFriends,
  getFriendRelationsForUsers,
  getReceivedFriendRequests,
  getSentFriendRequests,
} from "@/services/friends/friend.query";
import { parseFriendFilters } from "@/services/friends/friend.validator";
import { getUsers } from "@/services/users/user.query";
import type { FriendPageSearchParams } from "@/types/friend";

import FriendFilters from "./_components/friend-filters";
import FriendList from "./_components/friend-list";
import FriendRequests from "./_components/friend-requests";

type FriendPageProps = {
  searchParams: Promise<FriendPageSearchParams>;
};

export default async function FriendPage({ searchParams }: FriendPageProps) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  const filters = parseFriendFilters(params);

  const [friendUsers, friendCount, receivedRequests, sentRequests, users] =
    await Promise.all([
      getFriends({ filters, page: 1, userId }),
      getFriendCount({ filters, userId }),
      getReceivedFriendRequests(userId),
      getSentFriendRequests(userId),
      userId ? getUsers({ excludedUserId: userId }) : [],
    ]);

  const searchResults = await getFriendRelationsForUsers({ userId, users });

  return (
    <main className="page-shell bg-linear-to-b from-surface to-surface-container-low">
      <div className="page-container grid grid-cols-1 gap-gutter xl:grid-cols-12 xl:grid-rows-[2.75rem_auto]">
        <FriendFilters query={filters.query} searchResults={searchResults} />
        <FriendRequests
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
        />
        <FriendList
          emptyMessage={
            filters.query
              ? "검색 조건에 맞는 친구가 없습니다."
              : "아직 추가된 친구가 없습니다."
          }
          filters={filters}
          initialFriends={friendUsers}
          initialHasNextPage={FRIEND_PAGE_SIZE < friendCount}
          key={createFriendListKey(filters.query, friendUsers)}
        />
      </div>
    </main>
  );
}

function createFriendListKey(
  query: string,
  friends: { id: string }[],
) {
  return `${query}:${friends.map((friend) => friend.id).join(",")}`;
}
