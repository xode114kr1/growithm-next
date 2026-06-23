import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { Prisma } from "@/generated/prisma/client";

const signaturePrefix = "sha256=";

// 요청 본문과 시크릿으로 GitHub 웹훅 서명을 검증한다.
export function isValidGitHubWebhookSignature(
  rawBody: string,
  signature: string | null,
  webhookSecret: string,
) {
  if (!signature?.startsWith(signaturePrefix)) return false;

  const expectedSignature = `${signaturePrefix}${createHmac(
    "sha256",
    webhookSecret,
  )
    .update(rawBody)
    .digest("hex")}`;
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) return false;

  return timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
}

// 요청 본문을 저장 가능한 GitHub 웹훅 payload로 검증하고 변환한다.
export function parseGitHubWebhookPayload(rawBody: string) {
  try {
    return JSON.parse(rawBody) as Prisma.InputJsonValue;
  } catch {
    return null;
  }
}
