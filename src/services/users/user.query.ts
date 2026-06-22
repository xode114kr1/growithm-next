import "server-only";

import {
  createPersonalTier,
  createUserSummary,
} from "@/services/users/user.helper";
import {
  findUsersByQuery,
  findUserScore,
} from "@/services/users/user.persistence.server";
import type { UserPersonalTier, UserSummary } from "@/types/user";

// 사용자의 점수를 조회해 개인 티어 정보를 만든다.
export async function getUserPersonalTier(
  userId: string | undefined,
): Promise<UserPersonalTier> {
  if (!userId) {
    return createPersonalTier(0);
  }

  const user = await findUserScore(userId);

  return createPersonalTier(user?.score ?? 0);
}

// 검색어와 일치하는 사용자 목록을 현재 사용자 제외 후 조회한다.
export async function searchUsers({
  excludedUserId,
  query,
}: {
  excludedUserId: string;
  query: string;
}): Promise<UserSummary[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const users = await findUsersByQuery({
    excludedUserId,
    limit: 12,
    query: normalizedQuery,
  });

  return users.map(createUserSummary);
}
