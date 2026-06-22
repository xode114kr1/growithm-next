import type { FriendSearchResult } from "@/types/friend";
import type { UserProfile } from "@/types/user";

export async function searchUsers(query: string) {
  const searchParams = new URLSearchParams({ query });
  const response = await fetch(`/api/users?${searchParams}`);

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as FriendSearchResult[];
}

export async function getUserProfile(userId: string) {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as UserProfile;
}
