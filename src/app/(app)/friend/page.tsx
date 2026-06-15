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
        <FriendHeader />
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

function FriendHeader() {
  return (
    <header className="page-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="page-title mb-2">친구</h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          함께 성장할 친구를 찾고 학습 현황을 확인하세요.
        </p>
      </div>
    </header>
  );
}
