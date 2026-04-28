import { createHmac, timingSafeEqual } from "node:crypto";

import {
  getReadmeChangesFromPushPayload,
  getRepositoryFullName,
  type GitHubWebhookPayload,
} from "@/lib/github/webhook-payload";

const signaturePrefix = "sha256=";

export async function POST(request: Request) {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      { message: "GitHub 웹훅 시크릿이 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");
  const deliveryId = request.headers.get("x-github-delivery");
  const rawBody = await request.text();

  if (!isValidSignature(rawBody, signature, webhookSecret)) {
    return Response.json(
      { message: "GitHub 웹훅 서명이 올바르지 않습니다." },
      { status: 401 },
    );
  }

  let payload: GitHubWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as GitHubWebhookPayload;
  } catch {
    return Response.json(
      { message: "GitHub 웹훅 payload 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (event === "ping") {
    return Response.json({
      deliveryId,
      message: "GitHub 웹훅 ping을 확인했습니다.",
    });
  }

  if (event !== "push") {
    return Response.json({
      deliveryId,
      message: "처리 대상이 아닌 GitHub 웹훅 이벤트입니다.",
    });
  }

  return Response.json({
    deliveryId,
    message: "GitHub push 웹훅을 수신했습니다.",
    readmeChanges: getReadmeChangesFromPushPayload(payload),
    repository: getRepositoryFullName(payload),
  });
}

function isValidSignature(
  rawBody: string,
  signature: string | null,
  webhookSecret: string,
) {
  if (!signature?.startsWith(signaturePrefix)) {
    return false;
  }

  const expectedSignature = `${signaturePrefix}${createHmac(
    "sha256",
    webhookSecret,
  )
    .update(rawBody)
    .digest("hex")}`;

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
}

