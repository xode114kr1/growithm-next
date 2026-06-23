import "server-only";

import type {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getRepositoryOwnerId } from "@/server/webhook-delivery-processing/webhook-delivery-processing.mapper";
import type { GitHubWebhookPayload } from "@/types/github";

// 문제 처리에 필요한 저장된 웹훅 delivery를 조회한다.
export async function getWebhookDeliveryForProcessing(webhookDeliveryId: string) {
  return prisma.webhookDelivery.findUnique({
    select: {
      deliveryId: true,
      event: true,
      id: true,
      payload: true,
      repositoryFullName: true,
      status: true,
    },
    where: { id: webhookDeliveryId },
  });
}

// 처리 대기 상태인 delivery 하나를 원자적으로 PROCESSING 상태로 전환한다.
export async function claimWebhookDeliveryForProcessing(
  webhookDeliveryId: string,
) {
  const result = await prisma.webhookDelivery.updateMany({
    data: {
      errorMessage: null,
      processedAt: null,
      status: "PROCESSING",
    },
    where: {
      id: webhookDeliveryId,
      status: { in: ["RECEIVED", "QUEUED", "RETRY_PENDING"] },
    },
  });

  return result.count === 1;
}

// 저장된 웹훅 정보와 payload를 사용해 저장소 소유 사용자를 찾는다.
export async function getRepositoryOwner(
  repositoryFullName: string,
  payload: GitHubWebhookPayload,
) {
  const repositoryWebhook = await prisma.gitHubRepositoryWebhook.findUnique({
    select: { userId: true },
    where: { repositoryFullName },
  });

  if (!repositoryWebhook) {
    return getRepositoryOwnerFromPayload(repositoryFullName, payload);
  }

  const account = await prisma.account.findFirst({
    select: { access_token: true },
    where: { provider: "github", userId: repositoryWebhook.userId },
  });

  if (!account?.access_token) return null;

  return {
    accessToken: account.access_token,
    userId: repositoryWebhook.userId,
  };
}

// 웹훅 payload의 GitHub 소유자 ID로 연결된 사용자를 찾는다.
async function getRepositoryOwnerFromPayload(
  repositoryFullName: string,
  payload: GitHubWebhookPayload,
) {
  const ownerId = getRepositoryOwnerId(payload);

  if (!ownerId) return null;

  const account = await prisma.account.findFirst({
    select: { access_token: true, userId: true },
    where: { provider: "github", providerAccountId: ownerId },
  });

  if (!account?.access_token) return null;

  await prisma.gitHubRepositoryWebhook.upsert({
    create: { repositoryFullName, userId: account.userId },
    update: { userId: account.userId },
    where: { repositoryFullName },
  });

  return { accessToken: account.access_token, userId: account.userId };
}

// 준비된 문제 제출 데이터를 저장하고 사용자 점수 차이를 반영한다.
export async function saveProblemSubmission({
  accuracy,
  categories,
  code,
  commitSha,
  description,
  link,
  memory,
  platform,
  problemId,
  readmePath,
  repositoryFullName,
  score,
  scoreMax,
  status,
  submittedAtText,
  tier,
  time,
  title,
  userId,
  webhookDeliveryId,
}: {
  accuracy?: number;
  categories?: string[];
  code: string | null;
  commitSha: string;
  description?: string;
  link?: string;
  memory?: string;
  platform: ProblemPlatform;
  problemId: string;
  readmePath: string;
  repositoryFullName: string;
  score: number;
  scoreMax?: number;
  status: ProblemSubmissionStatus;
  submittedAtText?: string;
  tier?: string;
  time?: string;
  title: string;
  userId: string;
  webhookDeliveryId: string;
}) {
  await prisma.$transaction(async (tx) => {
    const submissionKey = `${repositoryFullName}:${commitSha}:${readmePath}`;
    // 동일 제출의 upsert와 점수 계산을 직렬화해 동시 Consumer의 이중 반영을 막는다.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${submissionKey}, 0))`;

    const existingSubmission = await tx.problemSubmission.findUnique({
      select: { score: true, userId: true },
      where: {
        repositoryFullName_commitSha_readmePath: {
          commitSha,
          readmePath,
          repositoryFullName,
        },
      },
    });

    await tx.problemSubmission.upsert({
      create: {
        accuracy,
        code,
        categories,
        commitSha,
        description,
        link,
        memory,
        platform,
        problemId,
        readmePath,
        repositoryFullName,
        score,
        scoreMax,
        status,
        submittedAtText,
        tier,
        time,
        title,
        userId,
        webhookDeliveryId,
      },
      update: {
        accuracy,
        code,
        categories,
        description,
        link,
        memory,
        platform,
        problemId,
        score,
        scoreMax,
        status,
        submittedAtText,
        tier,
        time,
        title,
        userId,
        webhookDeliveryId,
      },
      where: {
        repositoryFullName_commitSha_readmePath: {
          commitSha,
          readmePath,
          repositoryFullName,
        },
      },
    });

    const existingScore = existingSubmission?.score ?? 0;
    const scoreDelta =
      score - (existingSubmission?.userId === userId ? existingScore : 0);

    if (scoreDelta !== 0) {
      await tx.user.update({
        data: { score: { increment: scoreDelta } },
        where: { id: userId },
      });
    }

    if (
      existingSubmission?.userId &&
      existingSubmission.userId !== userId &&
      existingScore !== 0
    ) {
      await tx.user.update({
        data: { score: { decrement: existingScore } },
        where: { id: existingSubmission.userId },
      });
    }
  });
}

// 저장된 웹훅 delivery의 처리 상태와 오류를 갱신한다.
export async function updateWebhookDeliveryStatus({
  deliveryId,
  errorMessage,
  status,
}: {
  deliveryId: string;
  errorMessage?: string;
  status: WebhookDeliveryProcessingStatus;
}) {
  await prisma.webhookDelivery.update({
    data: {
      errorMessage,
      processedAt: isCompletedDeliveryStatus(status) ? new Date() : null,
      status,
    },
    where: { deliveryId },
  });
}

// Queue 메시지의 내부 ID로 저장된 웹훅 delivery 상태를 갱신한다.
export async function updateWebhookDeliveryStatusById({
  errorMessage,
  status,
  webhookDeliveryId,
}: {
  errorMessage?: string;
  status: WebhookDeliveryProcessingStatus;
  webhookDeliveryId: string;
}) {
  await prisma.webhookDelivery.update({
    data: {
      errorMessage,
      processedAt: isCompletedDeliveryStatus(status) ? new Date() : null,
      status,
    },
    where: { id: webhookDeliveryId },
  });
}

type WebhookDeliveryProcessingStatus =
  | "FAILED"
  | "PROCESSING"
  | "PROCESSED"
  | "RETRY_PENDING";

// 웹훅 delivery 처리가 종료된 상태인지 확인한다.
function isCompletedDeliveryStatus(status: WebhookDeliveryProcessingStatus) {
  return status === "FAILED" || status === "PROCESSED";
}
