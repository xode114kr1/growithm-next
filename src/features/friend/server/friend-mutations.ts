import "server-only";

import { prisma } from "@/lib/prisma";

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
