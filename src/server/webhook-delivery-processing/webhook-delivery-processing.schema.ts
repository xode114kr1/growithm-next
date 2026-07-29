import "server-only";

import type { ParsedProblemMetadata } from "@/server/webhook-delivery-processing/webhook-delivery-processing.types";
import type { WebhookDeliveryQueueMessage } from "@/types/queue";

// 파싱된 문제 정보에 필수 값이 있는지 검증한다.
export function validateParsedProblemMetadata(
  parsedMetadata: Partial<ParsedProblemMetadata>,
): ParsedProblemMetadata | null {
  if (
    !parsedMetadata.platform ||
    !parsedMetadata.problemId ||
    !parsedMetadata.title
  ) {
    return null;
  }

  return parsedMetadata as ParsedProblemMetadata;
}

// Queue 메시지에 처리할 웹훅 delivery ID가 있는지 검증한다.
export function isWebhookDeliveryQueueMessage(
  message: unknown,
): message is WebhookDeliveryQueueMessage {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const webhookDeliveryId = Reflect.get(message, "webhookDeliveryId");

  return typeof webhookDeliveryId === "string" && webhookDeliveryId.length > 0;
}
