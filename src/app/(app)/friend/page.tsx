import { auth } from "@/lib/auth/auth";
import {
  getFriendRelationsForUsers,
  getReceivedFriendRequests,
  getSentFriendRequests,
} from "@/services/friends/friend.query";
import { getFriendUsers, getUsers } from "@/services/users/user.server";
import type { FriendProfile } from "@/types/friend";

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

function FriendHeader() {
  return (
    <header className="page-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="page-title mb-2">Connections</h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          Manage your study circle, track friend progress, and collaborate on
          complex algorithmic challenges together.
        </p>
      </div>
    </header>
  );
}
