import "server-only";

import type {
  FriendRelationStatus,
  FriendSearchResult,
} from "@/types/friend";
import type {
  PersonalScoreTier,
  UserPersonalTier,
  UserProfile,
  UserSummary,
} from "@/types/user";

import { formatShortDate, formatSubmittedDateText } from "@/utils/date";
import {
  getNextScoreTierScore,
  getPersonalTier,
  getScoreProgressLabel,
  getScoreTierProgress,
  personalScoreTierThresholds,
} from "@/utils/score";

// 개인 점수의 현재 티어 내 진행률을 계산한다.
function getPersonalTierProgress(
  score: number,
  tier: PersonalScoreTier,
) {
  return getScoreTierProgress(score, tier, personalScoreTierThresholds);
}

// 개인 티어 진행도를 점수 범위 문자열로 만든다.
function getPersonalProgressLabel(
  score: number,
  tier: PersonalScoreTier,
) {
  return getScoreProgressLabel(score, tier, personalScoreTierThresholds);
}

// 개인 티어의 다음 티어 진입 점수를 반환한다.
function getNextPersonalTierScore(tier: PersonalScoreTier) {
  return getNextScoreTierScore(tier, personalScoreTierThresholds);
}

// 사용자 이름이 없을 때 사용할 표시 이름을 결정한다.
export function getUserDisplayName(name: string | null, email: string | null) {
  return name?.trim() || email?.trim() || "Unknown Developer";
}

// 사용자 이미지가 없을 때 기본 아바타 URL을 반환한다.
export function getUserAvatar(image: string | null) {
  return image || "https://avatars.githubusercontent.com/u/0?v=4";
}

export type UserSummaryRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};

type UserProfileRow = UserSummaryRow & {
  _count: {
    problemSubmissions: number;
  };
  accounts: {
    providerAccountId: string;
  }[];
  problemSubmissions: {
    createdAt: Date;
    submittedAtText: string | null;
  }[];
  todaySolvedCount: number;
};

type FriendshipRow = {
  userAId: string;
  userBId: string;
};

type ReceivedFriendRequestRow = {
  id: string;
  requesterId: string;
};

type SentFriendRequestRow = {
  addresseeId: string;
  id: string;
};

// 점수를 기반으로 개인 티어 표시 데이터를 구성한다.
export function createPersonalTier(score: number): UserPersonalTier {
  const tier = getPersonalTier(score);

  return {
    nextTierScore: getNextPersonalTierScore(tier),
    progress: getPersonalTierProgress(score, tier),
    progressLabel: getPersonalProgressLabel(score, tier),
    score,
    tier,
  };
}

// 사용자 조회 결과를 공용 사용자 요약 데이터로 변환한다.
export function createUserSummary(user: UserSummaryRow): UserSummary {
  return {
    avatar: getUserAvatar(user.image),
    id: user.id,
    name: getUserDisplayName(user.name, user.email),
    tier: getPersonalTier(user.score),
  };
}

// 사용자 조회 결과를 프로필 화면의 표시 데이터로 변환한다.
export function createUserProfile(user: UserProfileRow): UserProfile {
  const latestSubmission = user.problemSubmissions[0];

  return {
    ...createUserSummary(user),
    githubId: user.accounts[0]?.providerAccountId ?? null,
    latestSolvedAt: latestSubmission
      ? formatSubmittedDateText(latestSubmission.submittedAtText) ??
        formatShortDate(latestSubmission.createdAt)
      : null,
    score: user.score,
    solvedCount: user._count.problemSubmissions,
    todaySolvedCount: user.todaySolvedCount,
  };
}

// 사용자 요약과 친구 관계 조회 결과를 검색 결과로 합친다.
export function createFriendSearchResults({
  friendships,
  receivedRequests,
  sentRequests,
  userId,
  users,
}: {
  friendships: FriendshipRow[];
  receivedRequests: ReceivedFriendRequestRow[];
  sentRequests: SentFriendRequestRow[];
  userId: string;
  users: UserSummary[];
}): FriendSearchResult[] {
  const relationStatusByUserId = new Map<string, FriendRelationStatus>();
  const requestIdByUserId = new Map<string, string>();

  for (const friendship of friendships) {
    const friendUserId =
      friendship.userAId === userId
        ? friendship.userBId
        : friendship.userAId;

    relationStatusByUserId.set(friendUserId, "friend");
  }

  for (const request of receivedRequests) {
    relationStatusByUserId.set(request.requesterId, "received_request");
    requestIdByUserId.set(request.requesterId, request.id);
  }

  for (const request of sentRequests) {
    relationStatusByUserId.set(request.addresseeId, "sent_request");
    requestIdByUserId.set(request.addresseeId, request.id);
  }

  return users.map((user) => ({
    ...user,
    relationStatus: relationStatusByUserId.get(user.id) ?? "none",
    requestId: requestIdByUserId.get(user.id),
  }));
}
