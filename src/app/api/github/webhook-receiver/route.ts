import { receiveGitHubWebhook } from "@/services/webhook-receiver/webhook-receiver.server";

export async function POST(request: Request) {
  return receiveGitHubWebhook(request);
}
