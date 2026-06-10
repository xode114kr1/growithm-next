import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  FriendProfile,
  FriendRequest,
  FriendRelationStatus,
  FriendSearchResult,
} from "@/types/friend";
import type { UserSummary } from "@/types/user";
import {
  getUserAvatar,
  getUserDisplayName,
  getUserTier,
} from "@/utils/user";

type FriendUserRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};

export async function getReceivedFriendRequests(
  userId: string | undefined,
): Promise<FriendRequest[]> {
  if (!userId) {
    return [];
  }

  const requests = await prisma.friendRequest.findMany({
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
  });

  return requests.map((request) => ({
    ...createFriendProfile(request.requester, "received_request"),
    requestId: request.id,
    relationStatus: "received_request",
  }));
}

export async function getSentFriendRequests(
  userId: string | undefined,
): Promise<FriendRequest[]> {
  if (!userId) {
    return [];
  }

  const requests = await prisma.friendRequest.findMany({
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
  });

  return requests.map((request) => ({
    ...createFriendProfile(request.addressee, "sent_request"),
    requestId: request.id,
    relationStatus: "sent_request",
  }));
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
  const tier = getUserTier(user.score);

  return {
    avatar: getUserAvatar(user.image),
    id: user.id,
    name: getUserDisplayName(user.name, user.email),
    relationStatus,
    tier: tier.tier,
    tierClass: tier.tierClass,
  };
}

export async function getFriendRelationsForUsers({
  users,
  userId,
}: {
  users: UserSummary[];
  userId: string | undefined;
}): Promise<FriendSearchResult[]> {
  if (!userId || users.length === 0) {
    return [];
  }

  const userIds = users.map((user) => user.id);
  const [friendships, receivedRequests, sentRequests] = await Promise.all([
    prisma.friendship.findMany({
      select: {
        userAId: true,
        userBId: true,
      },
      where: {
        OR: [
          {
            userAId: userId,
            userBId: {
              in: userIds,
            },
          },
          {
            userAId: {
              in: userIds,
            },
            userBId: userId,
          },
        ],
      },
    }),
    prisma.friendRequest.findMany({
      select: {
        id: true,
        requesterId: true,
      },
      where: {
        addresseeId: userId,
        requesterId: {
          in: userIds,
        },
      },
    }),
    prisma.friendRequest.findMany({
      select: {
        addresseeId: true,
        id: true,
      },
      where: {
        addresseeId: {
          in: userIds,
        },
        requesterId: userId,
      },
    }),
  ]);

  const relationStatusByUserId = new Map<string, FriendRelationStatus>();
  const requestIdByUserId = new Map<string, string>();

  for (const friendship of friendships) {
    relationStatusByUserId.set(
      friendship.userAId === userId ? friendship.userBId : friendship.userAId,
      "friend",
    );
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

export async function sendFriendRequest({
  requesterId,
  targetUserId,
}: {
  requesterId: string;
  targetUserId: string;
}) {
  if (requesterId === targetUserId) {
    return;
  }

  const targetUser = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      id: targetUserId,
    },
  });

  if (!targetUser) {
    return;
  }

  const friendPair = normalizeFriendshipUserIds(requesterId, targetUserId);
  const [existingFriendship, receivedRequest] = await Promise.all([
    prisma.friendship.findUnique({
      select: {
        id: true,
      },
      where: {
        userAId_userBId: friendPair,
      },
    }),
    prisma.friendRequest.findUnique({
      select: {
        id: true,
      },
      where: {
        requesterId_addresseeId: {
          addresseeId: requesterId,
          requesterId: targetUserId,
        },
      },
    }),
  ]);

  if (existingFriendship || receivedRequest) {
    return;
  }

  await prisma.friendRequest.upsert({
    create: {
      addresseeId: targetUserId,
      requesterId,
    },
    update: {},
    where: {
      requesterId_addresseeId: {
        addresseeId: targetUserId,
        requesterId,
      },
    },
  });
}

export async function cancelFriendRequest({
  requesterId,
  requestId,
}: {
  requesterId: string;
  requestId: string;
}) {
  await prisma.friendRequest.deleteMany({
    where: {
      id: requestId,
      requesterId,
    },
  });
}

export async function deleteReceivedFriendRequest({
  addresseeId,
  requestId,
}: {
  addresseeId: string;
  requestId: string;
}) {
  await prisma.friendRequest.deleteMany({
    where: {
      addresseeId,
      id: requestId,
    },
  });
}

export async function acceptFriendRequest({
  addresseeId,
  requestId,
}: {
  addresseeId: string;
  requestId: string;
}) {
  const request = await prisma.friendRequest.findFirst({
    select: {
      requesterId: true,
    },
    where: {
      addresseeId,
      id: requestId,
    },
  });

  if (!request || request.requesterId === addresseeId) {
    return;
  }

  const friendPair = normalizeFriendshipUserIds(
    addresseeId,
    request.requesterId,
  );

  await prisma.$transaction([
    prisma.friendship.upsert({
      create: friendPair,
      update: {},
      where: {
        userAId_userBId: friendPair,
      },
    }),
    prisma.friendRequest.deleteMany({
      where: {
        OR: [
          {
            addresseeId,
            requesterId: request.requesterId,
          },
          {
            addresseeId: request.requesterId,
            requesterId: addresseeId,
          },
        ],
      },
    }),
  ]);
}

export async function deleteFriend({
  currentUserId,
  friendUserId,
}: {
  currentUserId: string;
  friendUserId: string;
}) {
  const friendPair = normalizeFriendshipUserIds(currentUserId, friendUserId);

  await prisma.friendship.deleteMany({
    where: friendPair,
  });
}

function normalizeFriendshipUserIds(firstUserId: string, secondUserId: string) {
  const [userAId, userBId] = [firstUserId, secondUserId].sort();

  return {
    userAId,
    userBId,
  };
}
