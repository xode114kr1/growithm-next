import "server-only";

import { getRepositoryFullName } from "@/server/github/github.mapper";
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
import type {
  ReceiveGitHubWebhookInput,
  ReceiveGitHubWebhookResult,
} from "@/server/webhook-receiver/webhook-receiver.types";
import type { GitHubWebhookPayload } from "@/types/github";

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

  // Schema: 요청 서명이 GitHub 웹훅 시크릿과 일치하는지 검증한다.
  if (!isValidGitHubWebhookSignature(rawBody, signature, webhookSecret)) {
    return {
      body: { message: "GitHub 웹훅 서명이 올바르지 않습니다." },
      status: 401,
    };
  }

  // Schema: 요청 본문을 저장 가능한 JSON payload로 파싱한다.
  const payload = parseGitHubWebhookPayload(rawBody);

  if (!payload) {
    return {
      body: { message: "GitHub 웹훅 payload 형식이 올바르지 않습니다." },
      status: 400,
    };
  }

  const webhookPayload = payload as GitHubWebhookPayload;

  // Mapper: payload에서 저장소 전체 이름을 추출한다.
  const repositoryFullName = getRepositoryFullName(webhookPayload);

  // Repository: delivery를 중복 없이 저장한다.
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

  // Command: 저장한 push delivery를 Queue 처리 흐름으로 넘긴다.
  const queueResult = await enqueueSavedWebhookDelivery({
    deliveryId,
    webhookDeliveryId: delivery.id,
  });

  return queueResult;
}

// 저장된 delivery를 Queue에 발행하고 처리 상태를 갱신한다.
async function enqueueSavedWebhookDelivery({
  deliveryId,
  webhookDeliveryId,
}: {
  deliveryId: string;
  webhookDeliveryId: string;
}): Promise<ReceiveGitHubWebhookResult> {
  let queueMessageId: string | null;

  try {
    // Gateway: 저장된 delivery의 처리 작업을 Queue에 발행한다.
    queueMessageId = await enqueueWebhookDelivery(webhookDeliveryId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Vercel Queue 발행 실패";

    // Repository: Queue 발행 실패 상태와 오류 메시지를 저장한다.
    await markWebhookDeliveryFailed({
      deliveryId,
      errorMessage,
    });

    return {
      body: {
        deliveryId,
        message: "GitHub 웹훅 처리 작업 등록에 실패했습니다.",
        status: "FAILED",
        webhookDeliveryId,
      },
      status: 503,
    };
  }

  // Repository: Queue 발행이 완료된 delivery 상태를 갱신한다.
  await markWebhookDeliveryQueued(deliveryId);

  return {
    body: {
      deliveryId,
      message: "GitHub push 웹훅을 수신했습니다.",
      queueMessageId,
      status: "QUEUED",
      webhookDeliveryId,
    },
    status: 202,
  };
}
