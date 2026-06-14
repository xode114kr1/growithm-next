import "server-only";

import { queue, WEBHOOK_DELIVERY_QUEUE_TOPIC } from "@/lib/queue";
import type { WebhookDeliveryQueueMessage } from "@/types/queue";

// 저장된 웹훅 delivery의 문제 처리 작업을 Queue에 발행한다.
export async function enqueueWebhookDelivery(webhookDeliveryId: string) {
  const message: WebhookDeliveryQueueMessage = { webhookDeliveryId };
  const result = await queue.send(WEBHOOK_DELIVERY_QUEUE_TOPIC, message, {
    idempotencyKey: webhookDeliveryId,
  });

  return result.messageId;
}
