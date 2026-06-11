import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { GitHubReadmeContent, GitHubWebhookPayload } from "@/types/github";
import { getRepositoryOwnerId } from "@/services/webhook-receiver/webhook-receiver.helper";
import { getProblemExperienceScore } from "@/services/problems/problem.helper";
import { parseProblemReadme } from "@/services/readme/problem-readme.helper";

export type GitHubCodeContent = {
  code: string | null;
  readmePath: string;
};

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
export async function saveProblemSubmissions({
  codeContents,
  readmes,
  repositoryFullName,
  userId,
  webhookDeliveryId,
}: {
  codeContents: GitHubCodeContent[];
  readmes: GitHubReadmeContent[];
  repositoryFullName: string;
  userId: string;
  webhookDeliveryId: string;
}) {
  let parseFailedCount = 0;
  let savedCount = 0;

  for (const readme of readmes) {
    const parsedReadme = parseProblemReadme(readme.text);
    const code =
      codeContents.find((codeContent) => codeContent.readmePath === readme.path)
        ?.code ?? null;

    if (!parsedReadme) {
      parseFailedCount += 1;
      continue;
    }

    const experienceScore = getProblemExperienceScore({
      platform: parsedReadme.platform,
      tier: parsedReadme.tier,
    });

    await prisma.$transaction(async (tx) => {
      const existingSubmission = await tx.problemSubmission.findUnique({
        select: { score: true },
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

      const scoreDelta = experienceScore - (existingSubmission?.score ?? 0);

      if (scoreDelta !== 0) {
        await tx.user.update({
          data: { score: { increment: scoreDelta } },
          where: { id: userId },
        });
      }
    });

    savedCount += 1;
  }

  return { parseFailedCount, savedCount };
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
    data: { errorMessage, processedAt: new Date(), status },
    where: { deliveryId },
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
  | "FETCH_FAILED"
  | "FAILED"
  | "IGNORED"
  | "NO_README"
  | "PARSE_FAILED"
  | "PROCESSED"
  | "RECEIVED";

// 웹훅 처리 상태가 재시도 가능한 상태인지 확인한다.
function isRetryableDeliveryStatus(status: string) {
  return (
    status === "FAILED" ||
    status === "FETCH_FAILED" ||
    status === "PARSE_FAILED"
  );
}
