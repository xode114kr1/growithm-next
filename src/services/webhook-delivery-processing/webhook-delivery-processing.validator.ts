import type { WebhookDeliveryQueueMessage } from "@/types/queue";

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
