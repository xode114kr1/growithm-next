import { receiveGitHubWebhook } from "@/services/webhook-receiver/webhook-receiver.command";

export async function POST(request: Request) {
  return receiveGitHubWebhook(request);
}
