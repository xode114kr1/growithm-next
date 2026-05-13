import { receiveGitHubWebhook } from "@/features/github/server/webhooks/receiver";

export async function POST(request: Request) {
  return receiveGitHubWebhook(request);
}
