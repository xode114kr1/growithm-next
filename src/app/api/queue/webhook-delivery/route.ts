import { queue } from "@/lib/queue";
import { processGitHubWebhookDelivery } from "@/services/webhook-receiver/webhook-receiver.server";
import { isWebhookDeliveryQueueMessage } from "@/services/webhook-receiver/webhook-receiver.validator";

export const POST = queue.handleCallback(async (message: unknown) => {
  if (!isWebhookDeliveryQueueMessage(message)) {
    throw new Error("웹훅 Delivery Queue 메시지 형식이 올바르지 않습니다.");
  }

  const response = await processGitHubWebhookDelivery(message.webhookDeliveryId);

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      message?: unknown;
    } | null;
    const errorMessage =
      typeof result?.message === "string"
        ? result.message
        : "웹훅 Delivery 처리에 실패했습니다.";

    throw new Error(errorMessage);
  }
});
