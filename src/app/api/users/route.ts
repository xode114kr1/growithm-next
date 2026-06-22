import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import { searchUsersWithRelation } from "@/services/users/user.query";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("query") ?? "";
  const results = await searchUsersWithRelation({
    excludedUserId: userId,
    query,
  });

  return Response.json(results);
}
