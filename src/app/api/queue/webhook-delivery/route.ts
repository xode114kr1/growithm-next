import { queue } from "@/lib/queue";
import { processGitHubWebhookDelivery } from "@/server/webhook-delivery-processing/webhook-delivery-processing.command.service";
import { isWebhookDeliveryQueueMessage } from "@/server/webhook-delivery-processing/webhook-delivery-processing.schema";

export const POST = queue.handleCallback(async (message: unknown) => {
  if (!isWebhookDeliveryQueueMessage(message)) {
    throw new Error("웹훅 Delivery Queue 메시지 형식이 올바르지 않습니다.");
  }

  await processGitHubWebhookDelivery(message.webhookDeliveryId);
});
