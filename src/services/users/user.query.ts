import "server-only";

import {
  createPersonalTier,
  createUserSummary,
  getUserAvatar,
  getUserDisplayName,
  getUserTier,
} from "@/services/users/user.helper";
import {
  findUserProfile,
  findUsersExcluding,
  findUserScore,
} from "@/services/users/user.persistence.server";
import type { UserPersonalTier, UserProfile, UserSummary } from "@/types/user";

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

// 사용자 프로필 정보를 조회하고 표시 데이터로 변환한다.
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await findUserProfile(userId);

  if (!user) {
    return null;
  }

  return {
    avatar: getUserAvatar(user.image),
    name: getUserDisplayName(user.name, user.email),
    score: user.score,
    tier: getUserTier(user.score),
  };
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
