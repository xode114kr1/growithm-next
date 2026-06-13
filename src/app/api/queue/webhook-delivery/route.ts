import { queue } from "@/lib/queue";
import { processGitHubWebhookDelivery } from "@/services/webhook-receiver/webhook-receiver.server";
import { updateWebhookDeliveryStatusById } from "@/services/webhook-receiver/webhook-receiver.persistence.server";
import { isWebhookDeliveryQueueMessage } from "@/services/webhook-receiver/webhook-receiver.validator";

export const POST = queue.handleCallback(async (message: unknown) => {
  if (!isWebhookDeliveryQueueMessage(message)) {
    throw new Error("웹훅 Delivery Queue 메시지 형식이 올바르지 않습니다.");
  }

  try {
    await processGitHubWebhookDelivery(message.webhookDeliveryId);
  } catch (error) {
    await updateWebhookDeliveryStatusById({
      errorMessage:
        error instanceof Error ? error.message : "웹훅 Delivery 재시도 대기",
      status: "RETRY_PENDING",
      webhookDeliveryId: message.webhookDeliveryId,
    });

    throw error;
  }
});
