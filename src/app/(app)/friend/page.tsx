import { auth } from "@/lib/auth/auth";
import {
  getFriendUsers,
  getFriendRelationsForUsers,
  getReceivedFriendRequests,
  getSentFriendRequests,
} from "@/services/friends/friend.query";
import { getUsers } from "@/services/users/user.query";

import FriendContent from "./_components/friend-content";

export default async function FriendPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [friendUsers, receivedRequests, sentRequests, users] = await Promise.all([
    getFriendUsers(userId),
    getReceivedFriendRequests(userId),
    getSentFriendRequests(userId),
    userId ? getUsers({ excludedUserId: userId }) : [],
  ]);
  const searchResults = await getFriendRelationsForUsers({ userId, users });

  return (
    <main className="page-shell">
      <div className="page-container">
        <FriendContent
          friends={friendUsers}
          receivedRequests={receivedRequests}
          searchResults={searchResults}
          sentRequests={sentRequests}
        />
      </div>
    </main>
  );
}
