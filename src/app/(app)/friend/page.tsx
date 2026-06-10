import { auth } from "@/lib/auth/auth";
import {
  getFriendRelationsForUsers,
  getReceivedFriendRequests,
  getSentFriendRequests,
} from "@/services/friend.server";
import { getFriendUsers, searchUsers } from "@/services/user.server";
import type { FriendListFilter, FriendProfile } from "@/types/friend";

import { FriendFilterTabs } from "./_components/friend-filter-tabs";
import { FriendListSection } from "./_components/friend-list-section";
import { FriendSearchSection } from "./_components/friend-search-section";

type FriendPageProps = {
  searchParams: Promise<{
    query?: string | string[];
    tab?: string | string[];
  }>;
};

export default async function FriendPage({ searchParams }: FriendPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const params = await searchParams;
  const activeTab = parseActiveTab(params.tab);
  const searchQuery = parseSearchQuery(params.query);
  const [friendUsers, receivedRequests, sentRequests, users] = await Promise.all([
    getFriendUsers(userId),
    getReceivedFriendRequests(userId),
    getSentFriendRequests(userId),
    userId ? searchUsers({ excludedUserId: userId, query: searchQuery }) : [],
  ]);
  const friends: FriendProfile[] = friendUsers.map((user) => ({
    ...user,
    relationStatus: "friend",
  }));
  const searchResults = await getFriendRelationsForUsers({ userId, users });

  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="page-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="page-title mb-2">
              Connections
            </h1>
            <p className="max-w-xl text-body-md text-on-surface-variant">
              Manage your study circle, track friend progress, and collaborate on
              complex algorithmic challenges together.
            </p>
          </div>
        </header>
        <section className="mb-8 flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
          <FriendFilterTabs activeTab={activeTab} searchQuery={searchQuery} />
          <FriendSearchSection
            initialSearchQuery={searchQuery}
            searchResults={searchResults}
          />
        </section>
        <FriendListSection
          activeTab={activeTab}
          friends={friends}
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
        />
      </div>
    </main>
  );
}

function parseActiveTab(tab: string | string[] | undefined): FriendListFilter {
  const value = Array.isArray(tab) ? tab[0] : tab;

  return value === "received" || value === "sent" ? value : "friends";
}

function parseSearchQuery(query: string | string[] | undefined) {
  const value = Array.isArray(query) ? query[0] : query;

  return value?.trim() ?? "";
}
