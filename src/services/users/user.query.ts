import "server-only";

import {
  createPersonalTier,
  createUserSummary,
  getUserAvatar,
  getUserDisplayName,
  getUserTier,
} from "@/services/users/user.helper";
import {
  findFriendUsers,
  findUserProfile,
  findUsersExcluding,
  findUserScore,
} from "@/services/users/user.persistence.server";
import type {
  UserPersonalTier,
  UserProfilePageData,
  UserSummary,
} from "@/types/user";

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

// 프로필 화면에 필요한 사용자 정보를 조회하고 표시 데이터로 변환한다.
export async function getUserProfilePageData(
  userId: string,
): Promise<UserProfilePageData | null> {
  const user = await findUserProfile(userId);

  if (!user) {
    return null;
  }

  const tier = getUserTier(user.score);

  return {
    avatar: getUserAvatar(user.image),
    name: getUserDisplayName(user.name, user.email),
    score: user.score,
    solvedCount: user._count.problemSubmissions,
    tier: tier.tier,
    tierClass: tier.tierClass,
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

// 현재 사용자의 친구 목록을 사용자 요약 데이터로 조회한다.
export async function getFriendUsers(
  userId: string | undefined,
): Promise<UserSummary[]> {
  if (!userId) {
    return [];
  }

  const friendships = await findFriendUsers(userId);

  return friendships.map((friendship) =>
    createUserSummary(
      friendship.userAId === userId ? friendship.userB : friendship.userA,
    ),
  );
}
