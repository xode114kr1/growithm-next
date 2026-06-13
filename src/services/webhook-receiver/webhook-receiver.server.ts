import "server-only";

import {
  queue,
  WEBHOOK_DELIVERY_QUEUE_TOPIC,
} from "@/lib/queue";
import { fetchGitHubReadmeContent } from "@/services/readme/readme.server";
import { fetchGitHubRawCode } from "@/services/webhook-receiver/webhook-receiver.client";
import {
  getWebhookDeliveryForProcessing,
  getRepositoryOwner,
  saveProblemSubmissions,
  saveWebhookDelivery,
  updateWebhookDeliveryStatus,
} from "@/services/webhook-receiver/webhook-receiver.persistence.server";
import type {
  GitHubReadmeContent,
  GitHubWebhookPayload,
} from "@/types/github";
import {
  getReadmeChangesFromPushPayload,
  getRepositoryFullName,
  buildRawGitHubContentUrl,
} from "@/services/webhook-receiver/webhook-receiver.helper";
import {
  isValidGitHubWebhookSignature,
  parseGitHubWebhookPayload,
} from "@/services/webhook-receiver/webhook-receiver.validator";
import type { WebhookDeliveryQueueMessage } from "@/types/queue";

// GitHub 웹훅 요청을 검증하고 delivery를 저장한다.
export async function receiveGitHubWebhook(request: Request) {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      { message: "GitHub 웹훅 시크릿이 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");
  const deliveryId = request.headers.get("x-github-delivery");
  const rawBody = await request.text();

  if (!deliveryId) {
    return Response.json(
      { message: "GitHub 웹훅 delivery id가 없습니다." },
      { status: 400 },
    );
  }

  if (!isValidGitHubWebhookSignature(rawBody, signature, webhookSecret)) {
    return Response.json(
      { message: "GitHub 웹훅 서명이 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const payload = parseGitHubWebhookPayload(rawBody);

  if (!payload) {
    return Response.json(
      { message: "GitHub 웹훅 payload 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const webhookPayload = payload as GitHubWebhookPayload;
  const repositoryFullName = getRepositoryFullName(webhookPayload);
  const delivery = await saveWebhookDelivery({
    deliveryId,
    event: event ?? "unknown",
    payload,
    repositoryFullName,
    status: event === "push" ? "RECEIVED" : "IGNORED",
  });

  if (!delivery.created) {
    return Response.json({
      deliveryId,
      message: "이미 수신한 GitHub 웹훅입니다.",
      status: delivery.status,
    });
  }

  if (event === "ping") {
    return Response.json({
      deliveryId,
      message: "GitHub 웹훅 ping을 확인했습니다.",
    });
  }

  if (event !== "push") {
    return Response.json({
      deliveryId,
      message: "처리 대상이 아닌 GitHub 웹훅 이벤트입니다.",
    });
  }

  let queueMessageId: string | null;

  try {
    queueMessageId = await enqueueWebhookDelivery(delivery.id);
    await updateWebhookDeliveryStatus({
      deliveryId,
      status: "QUEUED",
    });
  } catch (error) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage:
        error instanceof Error ? error.message : "Vercel Queue 발행 실패",
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "GitHub 웹훅 처리 작업 등록에 실패했습니다.",
      },
      { status: 502 },
    );
  }

  return Response.json(
    {
      deliveryId,
      message: "GitHub push 웹훅을 수신했습니다.",
      queueMessageId,
      status: "QUEUED",
      webhookDeliveryId: delivery.id,
    },
    { status: 202 },
  );
}

// 저장된 웹훅 delivery의 문제 처리 작업을 Queue에 발행한다.
export async function enqueueWebhookDelivery(webhookDeliveryId: string) {
  const message: WebhookDeliveryQueueMessage = { webhookDeliveryId };
  const result = await queue.send(WEBHOOK_DELIVERY_QUEUE_TOPIC, message, {
    idempotencyKey: webhookDeliveryId,
  });

  return result.messageId;
}

// 저장된 GitHub push delivery를 문제 제출 데이터로 처리한다.
export async function processGitHubWebhookDelivery(webhookDeliveryId: string) {
  const delivery = await getWebhookDeliveryForProcessing(webhookDeliveryId);

  if (!delivery) {
    return Response.json(
      { message: "처리할 GitHub 웹훅 delivery를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (delivery.status === "PROCESSED") {
    return Response.json({
      deliveryId: delivery.deliveryId,
      message: "이미 처리한 GitHub 웹훅 delivery입니다.",
    });
  }

  if (delivery.event !== "push") {
    return Response.json(
      {
        deliveryId: delivery.deliveryId,
        message: "처리 대상이 아닌 GitHub 웹훅 이벤트입니다.",
      },
      { status: 400 },
    );
  }

  const deliveryId = delivery.deliveryId;
  await updateWebhookDeliveryStatus({
    deliveryId,
    status: "PROCESSING",
  });

  const webhookPayload = delivery.payload as GitHubWebhookPayload;
  const repositoryFullName =
    delivery.repositoryFullName ?? getRepositoryFullName(webhookPayload);

  if (!repositoryFullName) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "GitHub repository 정보를 찾을 수 없습니다.",
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "GitHub repository 정보를 찾을 수 없습니다.",
      },
      { status: 400 },
    );
  }

  const readmeChanges = getReadmeChangesFromPushPayload(webhookPayload);

  const codeContents = await Promise.all(
    readmeChanges.map(async (change) => {
      if (!change.codePath) {
        return {
          code: null,
          codePath: null,
          codeUrl: null,
          readmePath: change.path,
          status: null,
        };
      }

      const codeUrl = buildRawGitHubContentUrl({
        commitSha: change.commitSha,
        path: change.codePath,
        repositoryFullName,
      });
      const response = await fetchGitHubRawCode(codeUrl);

      return {
        code: response.ok ? await response.text() : null,
        codePath: change.codePath,
        codeUrl,
        readmePath: change.path,
        status: response.status,
      };
    }),
  );

  if (readmeChanges.length === 0) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      status: "PROCESSED",
    });

    return Response.json({
      deliveryId,
      message: "README 변경이 없는 GitHub push 웹훅입니다.",
      readmeChanges,
      repository: repositoryFullName,
    });
  }

  const repositoryOwner = await getRepositoryOwner(
    repositoryFullName,
    webhookPayload,
  );

  if (!repositoryOwner) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
      },
      { status: 404 },
    );
  }

  let readmes: GitHubReadmeContent[];

  try {
    readmes = await Promise.all(
      readmeChanges.map((change) =>
        fetchGitHubReadmeContent({
          accessToken: repositoryOwner.accessToken,
          commitSha: change.commitSha,
          path: change.path,
          repositoryFullName,
        }),
      ),
    );
  } catch (error) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage:
        error instanceof Error ? error.message : "GitHub README 조회 실패",
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "GitHub README 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }

  const result = await saveProblemSubmissions({
    codeContents,
    webhookDeliveryId,
    readmes,
    repositoryFullName,
    userId: repositoryOwner.userId,
  });

  if (result.savedCount === 0) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "파싱 가능한 README를 찾을 수 없습니다.",
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "파싱 가능한 README를 찾을 수 없습니다.",
        parseFailedCount: result.parseFailedCount,
      },
      { status: 422 },
    );
  }

  await updateWebhookDeliveryStatus({
    deliveryId,
    status: "PROCESSED",
  });

  return Response.json({
    deliveryId,
    message: "GitHub push 웹훅 처리가 완료되었습니다.",
    parseFailedCount: result.parseFailedCount,
    readmeChanges,
    repository: repositoryFullName,
    savedCount: result.savedCount,
  });
}

