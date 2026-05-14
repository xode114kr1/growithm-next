import "server-only";

import {
  getFriendAvatar,
  getFriendDisplayName,
  getFriendTier,
} from "@/features/friend/utils";
import { prisma } from "@/lib/prisma";

import type {
  FriendListFilter,
  FriendListMap,
  FriendPageData,
  FriendProfile,
} from "@/features/friend/types";

type FriendUserRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};

const emptyFriendLists: FriendListMap = {
  friends: [],
  received: [],
  searchResults: [],
  sent: [],
};

export async function getFriendListByFilter<T extends FriendListFilter>(
  userId: string | undefined,
  filter: T,
): Promise<FriendListMap[T]> {
  const pageData = await getFriendPageData(userId);

  return pageData.lists[filter];
}

export async function getFriendPageData(
  userId: string | undefined,
): Promise<FriendPageData> {
  if (!userId) {
    return {
      lists: emptyFriendLists,
    };
  }

  const [friendships, receivedRequests, sentRequests] = await Promise.all([
    prisma.friendship.findMany({
      include: {
        userA: {
          select: friendUserSelect,
        },
        userB: {
          select: friendUserSelect,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    }),
    prisma.friendRequest.findMany({
      include: {
        requester: {
          select: friendUserSelect,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      where: {
        addresseeId: userId,
      },
    }),
    prisma.friendRequest.findMany({
      include: {
        addressee: {
          select: friendUserSelect,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      where: {
        requesterId: userId,
      },
    }),
  ]);

  return {
    lists: {
      friends: friendships.map((friendship) =>
        createFriendProfile(
          friendship.userAId === userId ? friendship.userB : friendship.userA,
          "friend",
        ),
      ),
      received: receivedRequests.map((request) => ({
        ...createFriendProfile(request.requester, "received_request"),
        requestId: request.id,
        relationStatus: "received_request",
      })),
      searchResults: [],
      sent: sentRequests.map((request) => ({
        ...createFriendProfile(request.addressee, "sent_request"),
        requestId: request.id,
        relationStatus: "sent_request",
      })),
    },
  };
}

const friendUserSelect = {
  email: true,
  id: true,
  image: true,
  name: true,
  score: true,
} satisfies Record<keyof FriendUserRow, true>;

function createFriendProfile(
  user: FriendUserRow,
  relationStatus: FriendProfile["relationStatus"],
): FriendProfile {
  const tier = getFriendTier(user.score);

  return {
    avatar: getFriendAvatar(user.image),
    id: user.id,
    name: getFriendDisplayName(user.name, user.email),
    relationStatus,
    tier: tier.tier,
    tierClass: tier.tierClass,
  };
}
