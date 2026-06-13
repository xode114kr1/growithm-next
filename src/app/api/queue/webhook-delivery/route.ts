import { queue } from "@/lib/queue";
import { updateWebhookDeliveryStatusById } from "@/services/webhook-delivery-processing/webhook-delivery-processing.persistence.server";
import { processGitHubWebhookDelivery } from "@/services/webhook-delivery-processing/webhook-delivery-processing.server";
import { isWebhookDeliveryQueueMessage } from "@/services/webhook-delivery-processing/webhook-delivery-processing.validator";

export const POST = queue.handleCallback(async (message: unknown) => {
  if (!isWebhookDeliveryQueueMessage(message)) {
    console.error("[WebhookQueue] consumer.invalid_message");
    throw new Error("웹훅 Delivery Queue 메시지 형식이 올바르지 않습니다.");
  }

  const startedAt = Date.now();
  console.info("[WebhookQueue] consumer.started", {
    webhookDeliveryId: message.webhookDeliveryId,
  });

  try {
    const result = await processGitHubWebhookDelivery(
      message.webhookDeliveryId,
    );

    console.info("[WebhookQueue] consumer.completed", {
      durationMs: Date.now() - startedAt,
      processingStatus: result.status,
      webhookDeliveryId: message.webhookDeliveryId,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "웹훅 Delivery 재시도 대기";

    await updateWebhookDeliveryStatusById({
      errorMessage,
      status: "RETRY_PENDING",
      webhookDeliveryId: message.webhookDeliveryId,
    });

    console.error("[WebhookQueue] consumer.retry_pending", {
      durationMs: Date.now() - startedAt,
      errorMessage,
      webhookDeliveryId: message.webhookDeliveryId,
    });

    throw error;
  }
});
