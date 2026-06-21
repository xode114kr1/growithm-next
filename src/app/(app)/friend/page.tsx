import { auth } from "@/lib/auth/auth";
import {
  getFriendUsers,
  getFriendRelationsForUsers,
  getReceivedFriendRequests,
  getSentFriendRequests,
} from "@/services/friends/friend.query";
import { getUsers } from "@/services/users/user.query";

import FriendFilters from "./_components/friend-filters";
import FriendList from "./_components/friend-list";
import FriendRequests from "./_components/friend-requests";

type FriendPageProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export default async function FriendPage({ searchParams }: FriendPageProps) {
  const params = await searchParams;
  const query = parseFriendQuery(params.query);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const session = await auth();
  const userId = session?.user?.id;
  const [friendUsers, receivedRequests, sentRequests, users] =
    await Promise.all([
      getFriendUsers(userId),
      getReceivedFriendRequests(userId),
      getSentFriendRequests(userId),
      userId ? getUsers({ excludedUserId: userId }) : [],
    ]);
  const searchResults = await getFriendRelationsForUsers({ userId, users });
  const filteredFriends = normalizedQuery
    ? friendUsers.filter((friend) =>
        friend.name.toLocaleLowerCase().includes(normalizedQuery),
      )
    : friendUsers;

  return (
    <main className="page-shell bg-linear-to-b from-surface to-surface-container-low">
      <div className="page-container grid grid-cols-1 gap-gutter xl:grid-cols-12">
        <FriendFilters query={query} searchResults={searchResults} />
        <FriendRequests
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
        />
        <section className="xl:col-span-8 xl:col-start-1 xl:row-start-2">
          <FriendList
            emptyMessage={
              query
                ? "검색 조건에 맞는 친구가 없습니다."
                : "아직 추가된 친구가 없습니다."
            }
            friends={filteredFriends}
            key={query}
          />
        </section>
      </div>
    </main>
  );
}

function parseFriendQuery(query: string | string[] | undefined) {
  return (Array.isArray(query) ? query[0] : query)?.trim() ?? "";
}
