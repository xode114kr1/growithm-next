import "server-only";

import {
  createPersonalTier,
  createUserSummary,
} from "@/services/users/user.helper";
import {
  findUsersExcluding,
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

// 제외 조건에 맞는 사용자 목록을 사용자 요약 데이터로 조회한다.
export async function getUsers({
  excludedUserId,
}: {
  excludedUserId: string;
}): Promise<UserSummary[]> {
  const users = await findUsersExcluding(excludedUserId);

  return users.map(createUserSummary);
}
