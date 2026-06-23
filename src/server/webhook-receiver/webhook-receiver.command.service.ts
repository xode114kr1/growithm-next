import "server-only";

import { getRepositoryFullName } from "@/server/github/github-webhook.helper";
import { enqueueWebhookDelivery } from "@/server/webhook-receiver/webhook-receiver.gateway";
import {
  markWebhookDeliveryFailed,
  markWebhookDeliveryQueued,
  saveWebhookDelivery,
} from "@/server/webhook-receiver/webhook-receiver.repository";
import {
  isValidGitHubWebhookSignature,
  parseGitHubWebhookPayload,
} from "@/server/webhook-receiver/webhook-receiver.schema";
import type { GitHubWebhookPayload } from "@/types/github";

type ReceiveGitHubWebhookInput = {
  deliveryId: string | null;
  event: string | null;
  rawBody: string;
  signature: string | null;
};

type ReceiveGitHubWebhookResult = {
  body: {
    deliveryId?: string;
    message: string;
    queueMessageId?: string | null;
    status?: string;
    webhookDeliveryId?: string;
  };
  status?: number;
};

// GitHub 웹훅을 검증하고 delivery를 저장한 뒤 처리 Queue에 등록한다.
export async function receiveGitHubWebhook({
  deliveryId,
  event,
  rawBody,
  signature,
}: ReceiveGitHubWebhookInput): Promise<ReceiveGitHubWebhookResult> {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return {
      body: { message: "GitHub 웹훅 시크릿이 설정되지 않았습니다." },
      status: 500,
    };
  }

  if (!deliveryId) {
    return {
      body: { message: "GitHub 웹훅 delivery id가 없습니다." },
      status: 400,
    };
  }

  if (!isValidGitHubWebhookSignature(rawBody, signature, webhookSecret)) {
    return {
      body: { message: "GitHub 웹훅 서명이 올바르지 않습니다." },
      status: 401,
    };
  }

  const payload = parseGitHubWebhookPayload(rawBody);

  if (!payload) {
    return {
      body: { message: "GitHub 웹훅 payload 형식이 올바르지 않습니다." },
      status: 400,
    };
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
    return {
      body: {
        deliveryId,
        message: "이미 수신한 GitHub 웹훅입니다.",
        status: delivery.status,
      },
    };
  }

  if (event === "ping") {
    return {
      body: {
        deliveryId,
        message: "GitHub 웹훅 ping을 확인했습니다.",
      },
    };
  }

  if (event !== "push") {
    return {
      body: {
        deliveryId,
        message: "처리 대상이 아닌 GitHub 웹훅 이벤트입니다.",
      },
    };
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

    return {
      body: {
        deliveryId,
        message: "GitHub 웹훅 처리 작업 등록에 실패했습니다.",
        status: "FAILED",
        webhookDeliveryId: delivery.id,
      },
      status: 503,
    };
  }

  await markWebhookDeliveryQueued(deliveryId);

  console.info("[WebhookQueue] publish.succeeded", {
    deliveryId,
    queueMessageId,
    webhookDeliveryId: delivery.id,
  });

  return {
    body: {
      deliveryId,
      message: "GitHub push 웹훅을 수신했습니다.",
      queueMessageId,
      status: "QUEUED",
      webhookDeliveryId: delivery.id,
    },
    status: 202,
  };
}
