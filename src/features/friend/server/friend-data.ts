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
  FriendPageSearchParams,
  FriendProfile,
  FriendRelationStatus,
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
  params: FriendPageSearchParams = {},
): Promise<FriendPageData> {
  const searchQuery = parseSearchQuery(params.query);

  if (!userId) {
    return {
      lists: emptyFriendLists,
      searchQuery,
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
  const searchResults = await getFriendSearchResults({
    friendships,
    query: searchQuery,
    receivedRequests,
    sentRequests,
    userId,
  });

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
      searchResults,
      sent: sentRequests.map((request) => ({
        ...createFriendProfile(request.addressee, "sent_request"),
        requestId: request.id,
        relationStatus: "sent_request",
      })),
    },
    searchQuery,
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

async function getFriendSearchResults({
  friendships,
  query,
  receivedRequests,
  sentRequests,
  userId,
}: {
  friendships: Array<{
    userA: FriendUserRow;
    userAId: string;
    userB: FriendUserRow;
    userBId: string;
  }>;
  query: string;
  receivedRequests: Array<{ requester: FriendUserRow; requesterId: string }>;
  sentRequests: Array<{ addressee: FriendUserRow; addresseeId: string }>;
  userId: string;
}) {
  if (!query) {
    return [];
  }

  const users = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
    select: friendUserSelect,
    take: 12,
    where: {
      AND: [
        {
          id: {
            not: userId,
          },
        },
        {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
  });

  const relationStatusByUserId = new Map<string, FriendRelationStatus>();

  for (const friendship of friendships) {
    relationStatusByUserId.set(
      friendship.userAId === userId ? friendship.userBId : friendship.userAId,
      "friend",
    );
  }

  for (const request of receivedRequests) {
    relationStatusByUserId.set(request.requesterId, "received_request");
  }

  for (const request of sentRequests) {
    relationStatusByUserId.set(request.addresseeId, "sent_request");
  }

  return users.map((user) =>
    createFriendProfile(user, relationStatusByUserId.get(user.id) ?? "none"),
  );
}

function parseSearchQuery(query: string | string[] | undefined) {
  const value = Array.isArray(query) ? query[0] : query;

  return value?.trim() ?? "";
}
