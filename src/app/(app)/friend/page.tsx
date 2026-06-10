import { auth } from "@/lib/auth/auth";
import {
  getFriendRelationsForUsers,
  getReceivedFriendRequests,
  getSentFriendRequests,
} from "@/services/friend.server";
import { getFriendUsers, getUsers } from "@/services/user.server";
import type { FriendProfile } from "@/types/friend";

import FriendContent from "./_components/friend-content";
import FriendHeader from "./_components/friend-header";

export default async function FriendPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [friendUsers, receivedRequests, sentRequests, users] = await Promise.all([
    getFriendUsers(userId),
    getReceivedFriendRequests(userId),
    getSentFriendRequests(userId),
    userId ? getUsers({ excludedUserId: userId }) : [],
  ]);
  const friends: FriendProfile[] = friendUsers.map((user) => ({
    ...user,
    relationStatus: "friend",
  }));
  const searchResults = await getFriendRelationsForUsers({ userId, users });

  return (
    <main className="page-shell">
      <div className="page-container">
        <FriendHeader />
        <FriendContent
          friends={friends}
          receivedRequests={receivedRequests}
          searchResults={searchResults}
          sentRequests={sentRequests}
        />
      </div>
    </main>
  );
}
