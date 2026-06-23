import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { FriendUserRow } from "@/server/friends/friend.helper";

const friendUserSelect = {
  email: true,
  id: true,
  image: true,
  name: true,
  score: true,
} satisfies Record<keyof FriendUserRow, true>;

// 현재 사용자와 친구 관계인 사용자 정보를 조회한다.
export async function findFriendUsers({
  page,
  pageSize,
  query,
  userId,
}: {
  page: number;
  pageSize: number;
  query: string;
  userId: string;
}) {
  return prisma.friendship.findMany({
    include: {
      userA: {
        select: friendUserSelect,
      },
      userB: {
        select: friendUserSelect,
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: buildFriendshipWhere({ query, userId }),
  });
}

// 현재 사용자의 검색 조건에 맞는 친구 수를 조회한다.
export async function countFriendUsers({
  query,
  userId,
}: {
  query: string;
  userId: string;
}) {
  return prisma.friendship.count({
    where: buildFriendshipWhere({ query, userId }),
  });
}

// 현재 사용자가 받은 친구 요청과 요청자 정보를 조회한다.
export async function findReceivedFriendRequests(userId: string) {
  return prisma.friendRequest.findMany({
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
}

// 현재 사용자가 보낸 친구 요청과 수신자 정보를 조회한다.
export async function findSentFriendRequests(userId: string) {
  return prisma.friendRequest.findMany({
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
}

// 대상 사용자들과의 친구 관계 및 양방향 요청을 조회한다.
export async function findFriendRelationsForUserIds({
  userId,
  userIds,
}: {
  userId: string;
  userIds: string[];
}) {
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

  return { friendships, receivedRequests, sentRequests };
}

function buildFriendshipWhere({
  query,
  userId,
}: {
  query: string;
  userId: string;
}): Prisma.FriendshipWhereInput {
  if (!query) {
    return {
      OR: [{ userAId: userId }, { userBId: userId }],
    };
  }

  const friendUserFilter: Prisma.UserWhereInput = {
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
  };

  return {
    OR: [
      {
        userAId: userId,
        userB: friendUserFilter,
      },
      {
        userA: friendUserFilter,
        userBId: userId,
      },
    ],
  };
}

// 사용자 ID에 해당하는 사용자의 존재 여부를 조회한다.
export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      id: userId,
    },
  });
}

// 정규화된 친구 관계와 반대 방향 친구 요청을 함께 조회한다.
export async function findFriendshipAndReceivedRequest({
  friendPair,
  requesterId,
  targetUserId,
}: {
  friendPair: { userAId: string; userBId: string };
  requesterId: string;
  targetUserId: string;
}) {
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

  return { existingFriendship, receivedRequest };
}

// 동일 방향 친구 요청을 중복 없이 저장한다.
export async function upsertFriendRequest({
  requesterId,
  targetUserId,
}: {
  requesterId: string;
  targetUserId: string;
}) {
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

// 요청자와 요청 ID가 일치하는 보낸 친구 요청을 삭제한다.
export async function deleteSentFriendRequest({
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

// 수신자와 요청 ID가 일치하는 받은 친구 요청을 거절 처리한다.
export async function rejectReceivedFriendRequest({
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

// 현재 사용자가 받은 특정 친구 요청의 요청자 ID를 조회한다.
export async function findReceivedFriendRequest({
  addresseeId,
  requestId,
}: {
  addresseeId: string;
  requestId: string;
}) {
  return prisma.friendRequest.findFirst({
    select: {
      requesterId: true,
    },
    where: {
      addresseeId,
      id: requestId,
    },
  });
}

// 친구 관계를 생성하고 두 사용자 사이의 대기 요청을 삭제한다.
export async function acceptFriendship({
  addresseeId,
  friendPair,
  requesterId,
}: {
  addresseeId: string;
  friendPair: { userAId: string; userBId: string };
  requesterId: string;
}) {
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
            requesterId,
          },
          {
            addresseeId: requesterId,
            requesterId: addresseeId,
          },
        ],
      },
    }),
  ]);
}

// 정규화된 두 사용자 사이의 친구 관계를 삭제한다.
export async function deleteFriendship(friendPair: {
  userAId: string;
  userBId: string;
}) {
  await prisma.friendship.deleteMany({
    where: friendPair,
  });
}
