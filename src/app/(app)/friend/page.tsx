import FriendNetwork from "@/features/friend/components/friend-network";
import { getFriendPageData } from "@/features/friend/server/friend-data";
import type { FriendPageSearchParams } from "@/features/friend/types";
import { auth } from "@/lib/auth/auth";

type FriendPageProps = {
  searchParams: Promise<FriendPageSearchParams>;
};

export default async function FriendPage({ searchParams }: FriendPageProps) {
  const session = await auth();
  const friendPageData = await getFriendPageData(
    session?.user?.id,
    await searchParams,
  );

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
        <FriendNetwork
          friendLists={friendPageData.lists}
          searchQuery={friendPageData.searchQuery}
        />
      </div>
    </main>
  );
}
