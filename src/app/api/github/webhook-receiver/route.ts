import { receiveGitHubWebhook } from "@/services/github/webhook-receiver.server";

export async function POST(request: Request) {
  return receiveGitHubWebhook(request);
}
