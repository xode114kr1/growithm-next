import { auth } from "@/lib/auth/auth";
import {
  getFriendUsers,
  getFriendRelationsForUsers,
  getReceivedFriendRequests,
  getSentFriendRequests,
} from "@/services/friends/friend.query";
import { getUsers } from "@/services/users/user.query";

import FriendContent from "./_components/friend-content";

export default async function FriendPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = Array.isArray(params.query)
    ? (params.query[0] ?? "")
    : (params.query ?? "");
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
      <div className="page-container">
        <FriendContent
          friendQuery={query}
          friends={filteredFriends}
          receivedRequests={receivedRequests}
          searchResults={searchResults}
          sentRequests={sentRequests}
        />
      </div>
    </main>
  );
}
