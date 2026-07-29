import "server-only";

export type ReceiveGitHubWebhookInput = {
  deliveryId: string | null;
  event: string | null;
  rawBody: string;
  signature: string | null;
};

export type ReceiveGitHubWebhookResult = {
  body: {
    deliveryId?: string;
    message: string;
    queueMessageId?: string | null;
    status?: string;
    webhookDeliveryId?: string;
  };
  status?: number;
};
