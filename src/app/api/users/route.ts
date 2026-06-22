import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import { getFriendRelationsForUsers } from "@/services/friends/friend.query";
import { searchUsers } from "@/services/users/user.query";
import type { FriendSearchResult } from "@/types/friend";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("query") ?? "";
  const users = await searchUsers({
    excludedUserId: userId,
    query,
  });
  const results: FriendSearchResult[] = await getFriendRelationsForUsers({
    userId,
    users,
  });

  return Response.json(results);
}
