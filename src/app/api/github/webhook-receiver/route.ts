import { receiveGitHubWebhook } from "@/server/webhook-receiver/webhook-receiver.command";

export async function POST(request: Request) {
  const result = await receiveGitHubWebhook({
    deliveryId: request.headers.get("x-github-delivery"),
    event: request.headers.get("x-github-event"),
    rawBody: await request.text(),
    signature: request.headers.get("x-hub-signature-256"),
  });

  return Response.json(
    result.body,
    result.status ? { status: result.status } : undefined,
  );
}
