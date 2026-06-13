import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { GitHubReadmeContent, GitHubWebhookPayload } from "@/types/github";
import { getRepositoryOwnerId } from "@/services/webhook-receiver/webhook-receiver.helper";
import { getProblemExperienceScore } from "@/services/problems/problem.helper";
import { parseProblemReadme } from "@/services/readme/problem-readme.helper";

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

// Queue 발행 후 아직 대기 중인 delivery만 QUEUED 상태로 전환한다.
export async function markWebhookDeliveryQueued(deliveryId: string) {
  await prisma.webhookDelivery.updateMany({
    data: { status: "QUEUED" },
    where: {
      deliveryId,
      status: "RECEIVED",
    },
  });
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

// README와 코드 내용을 문제 제출 데이터로 저장하고 점수를 반영한다.
export async function saveProblemSubmission({
  code,
  readme,
  repositoryFullName,
  userId,
  webhookDeliveryId,
}: {
  code: string | null;
  readme: GitHubReadmeContent;
  repositoryFullName: string;
  userId: string;
  webhookDeliveryId: string;
}) {
  const parsedReadme = parseProblemReadme(readme.text);

  if (!parsedReadme) {
    return { failureReason: "PARSE_FAILED" as const, saved: false as const };
  }

  const experienceScore = getProblemExperienceScore({
    platform: parsedReadme.platform,
    tier: parsedReadme.tier,
  });

  await prisma.$transaction(async (tx) => {
    const submissionKey = `${repositoryFullName}:${readme.commitSha}:${readme.path}`;
    // 동일 제출의 upsert와 점수 계산을 직렬화해 동시 Consumer의 이중 반영을 막는다.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${submissionKey}, 0))`;

    const existingSubmission = await tx.problemSubmission.findUnique({
      select: { score: true, userId: true },
      where: {
        repositoryFullName_commitSha_readmePath: {
          commitSha: readme.commitSha,
          readmePath: readme.path,
          repositoryFullName,
        },
      },
    });

    await tx.problemSubmission.upsert({
      create: {
        accuracy: parsedReadme.accuracy,
        code,
        categories: parsedReadme.categories,
        commitSha: readme.commitSha,
        description: parsedReadme.description,
        link: parsedReadme.link,
        memory: parsedReadme.memory,
        platform: parsedReadme.platform,
        problemId: parsedReadme.problemId,
        readmePath: readme.path,
        repositoryFullName,
        score: experienceScore,
        scoreMax: parsedReadme.scoreMax,
        status: ProblemSubmissionStatus.PENDING,
        submittedAtText: parsedReadme.submittedAtText,
        tier: parsedReadme.tier,
        time: parsedReadme.time,
        title: parsedReadme.title,
        userId,
        webhookDeliveryId,
      },
      update: {
        accuracy: parsedReadme.accuracy,
        code,
        categories: parsedReadme.categories,
        description: parsedReadme.description,
        link: parsedReadme.link,
        memory: parsedReadme.memory,
        platform: parsedReadme.platform,
        problemId: parsedReadme.problemId,
        score: experienceScore,
        scoreMax: parsedReadme.scoreMax,
        status: ProblemSubmissionStatus.PENDING,
        submittedAtText: parsedReadme.submittedAtText,
        tier: parsedReadme.tier,
        time: parsedReadme.time,
        title: parsedReadme.title,
        userId,
        webhookDeliveryId,
      },
      where: {
        repositoryFullName_commitSha_readmePath: {
          commitSha: readme.commitSha,
          readmePath: readme.path,
          repositoryFullName,
        },
      },
    });

    const existingScore = existingSubmission?.score ?? 0;
    const scoreDelta =
      experienceScore -
      (existingSubmission?.userId === userId ? existingScore : 0);

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

  return { saved: true as const };
}

// 저장된 웹훅 delivery의 처리 상태와 오류를 갱신한다.
export async function updateWebhookDeliveryStatus({
  deliveryId,
  errorMessage,
  status,
}: {
  deliveryId: string;
  errorMessage?: string;
  status: WebhookDeliveryStatus;
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
  status: WebhookDeliveryStatus;
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

// 웹훅 delivery를 중복 없이 저장하고 처리 가능 상태를 반환한다.
export async function saveWebhookDelivery({
  deliveryId,
  event,
  payload,
  repositoryFullName,
  status,
}: {
  deliveryId: string;
  event: string;
  payload: Prisma.InputJsonValue;
  repositoryFullName: string | null;
  status: WebhookDeliveryStatus;
}) {
  const existingDelivery = await prisma.webhookDelivery.findUnique({
    select: { id: true, status: true },
    where: { deliveryId },
  });

  if (existingDelivery) {
    if (isRetryableDeliveryStatus(existingDelivery.status)) {
      await prisma.webhookDelivery.update({
        data: {
          errorMessage: null,
          event,
          payload,
          processedAt: null,
          repositoryFullName,
          status,
        },
        where: { deliveryId },
      });

      return { created: true, id: existingDelivery.id, status };
    }

    return {
      created: false,
      id: existingDelivery.id,
      status: existingDelivery.status,
    };
  }

  const delivery = await prisma.webhookDelivery.create({
    data: { deliveryId, event, payload, repositoryFullName, status },
    select: { id: true, status: true },
  });

  return { created: true, id: delivery.id, status: delivery.status };
}

type WebhookDeliveryStatus =
  | "FAILED"
  | "IGNORED"
  | "PROCESSING"
  | "PROCESSED"
  | "QUEUED"
  | "RECEIVED"
  | "RETRY_PENDING";

// 웹훅 처리 상태가 재시도 가능한 상태인지 확인한다.
function isRetryableDeliveryStatus(status: string) {
  return status === "FAILED";
}

// 웹훅 delivery 처리가 종료된 상태인지 확인한다.
function isCompletedDeliveryStatus(status: WebhookDeliveryStatus) {
  return status === "FAILED" || status === "IGNORED" || status === "PROCESSED";
}
