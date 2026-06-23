import "server-only";

import { auth } from "@/lib/auth/auth";

export async function getCurrentUserId() {
  const session = await auth();

  return session?.user?.id ?? null;
}
