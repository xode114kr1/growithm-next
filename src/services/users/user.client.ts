import type { FriendSearchResult } from "@/types/friend";

export async function searchUsers(query: string) {
  const searchParams = new URLSearchParams({ query });
  const response = await fetch(`/api/users?${searchParams}`);

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as FriendSearchResult[];
}
