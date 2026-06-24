import type { FriendInfiniteScrollResponse } from "@/types/friend";

export async function getFriendsPage({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(page),
  });

  if (query) {
    searchParams.set("query", query);
  }

  const response = await fetch(`/api/friends?${searchParams}`);

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as FriendInfiniteScrollResponse;
}
