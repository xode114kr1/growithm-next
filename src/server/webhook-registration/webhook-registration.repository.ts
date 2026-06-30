import "server-only";

import { prisma } from "@/lib/prisma";

// 사용자의 GitHub 계정 access token을 조회한다.
export async function findGitHubAccessToken(userId: string) {
  return prisma.account.findFirst({
    select: {
      access_token: true,
    },
    where: {
      provider: "github",
      userId,
    },
  });
}

// 사용자가 가장 최근에 연결한 GitHub 웹훅 정보를 조회한다.
export async function findLatestGitHubRepositoryWebhook(userId: string) {
  return prisma.gitHubRepositoryWebhook.findFirst({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      repositoryFullName: true,
    },
    where: {
      userId,
    },
  });
}

// GitHub 저장소와 사용자 사이의 웹훅 연결 정보를 저장한다.
export async function upsertGitHubRepositoryWebhook({
  hookId,
  repositoryFullName,
  userId,
}: {
  hookId: number | null;
  repositoryFullName: string;
  userId: string;
}) {
  await prisma.gitHubRepositoryWebhook.upsert({
    create: {
      hookId,
      repositoryFullName,
      userId,
    },
    update: {
      hookId,
      userId,
    },
    where: {
      repositoryFullName,
    },
  });
}
