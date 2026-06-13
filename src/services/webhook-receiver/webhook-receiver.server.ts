import "server-only";

import { queue, WEBHOOK_DELIVERY_QUEUE_TOPIC } from "@/lib/queue";
import {
  markWebhookDeliveryFailed,
  markWebhookDeliveryQueued,
  saveWebhookDelivery,
} from "@/services/webhook-receiver/webhook-receiver.persistence.server";
import { getRepositoryFullName } from "@/services/github/github-webhook.helper";
import type { GitHubWebhookPayload } from "@/types/github";
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

  console.info("[WebhookQueue] publish.started", {
    deliveryId,
    webhookDeliveryId: delivery.id,
  });

  try {
    queueMessageId = await enqueueWebhookDelivery(delivery.id);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Vercel Queue 발행 실패";

    console.error("[WebhookQueue] publish.failed", {
      deliveryId,
      errorMessage,
      webhookDeliveryId: delivery.id,
    });

    await markWebhookDeliveryFailed({
      deliveryId,
      errorMessage,
    });

    return Response.json(
      {
        deliveryId,
        message: "GitHub 웹훅 처리 작업 등록에 실패했습니다.",
        status: "FAILED",
        webhookDeliveryId: delivery.id,
      },
      { status: 503 },
    );
  }

  await markWebhookDeliveryQueued(deliveryId);

  console.info("[WebhookQueue] publish.succeeded", {
    deliveryId,
    queueMessageId,
    webhookDeliveryId: delivery.id,
  });

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
