import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import {
  FRIEND_PAGE_SIZE,
  getFriendCount,
  getFriends,
} from "@/services/friends/friend.query";
import {
  parseFriendFilters,
  parseFriendPage,
} from "@/services/friends/friend.validator";
import type {
  FriendInfiniteScrollResponse,
  FriendPageSearchParams,
} from "@/types/friend";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams: FriendPageSearchParams = {
    query: request.nextUrl.searchParams.get("query") ?? undefined,
  };
  const filters = parseFriendFilters(searchParams);
  const page = parseFriendPage(
    request.nextUrl.searchParams.get("page") ?? undefined,
  );
  const [friends, totalCount] = await Promise.all([
    getFriends({ filters, page, userId }),
    getFriendCount({ filters, userId }),
  ]);
  const response: FriendInfiniteScrollResponse = {
    currentPage: page,
    hasNextPage: page * FRIEND_PAGE_SIZE < totalCount,
    items: friends,
    totalCount,
  };

  return Response.json(response);
}
