import "server-only";

import { QueueClient } from "@vercel/queue";

export const WEBHOOK_DELIVERY_QUEUE_TOPIC = "webhook-delivery-processing";

export const queue = new QueueClient();
