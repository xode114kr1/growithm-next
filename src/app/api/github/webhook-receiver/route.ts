import { createHmac, timingSafeEqual } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { fetchGitHubReadmeContent } from "@/lib/github/readme-content";
import {
  getReadmeChangesFromPushPayload,
  getRepositoryFullName,
  type GitHubWebhookPayload,
} from "@/lib/github/webhook-payload";
import { prisma } from "@/lib/prisma";

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

  if (!deliveryId) {
    return Response.json(
      { message: "GitHub 웹훅 delivery id가 없습니다." },
      { status: 400 },
    );
  }

  if (!isValidSignature(rawBody, signature, webhookSecret)) {
    return Response.json(
      { message: "GitHub 웹훅 서명이 올바르지 않습니다." },
      { status: 401 },
    );
  }

  let payload: Prisma.InputJsonValue;

  try {
    payload = JSON.parse(rawBody) as Prisma.InputJsonValue;
  } catch {
    return Response.json(
      { message: "GitHub 웹훅 payload 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const webhookPayload = payload as GitHubWebhookPayload;
  const repositoryFullName = getRepositoryFullName(webhookPayload);
  const delivery = await saveWebhookDelivery({
    deliveryId,
    event: event ?? "unknown",
    payload,
    repositoryFullName,
    status: event === "push" ? "RECEIVED" : "IGNORED",
  });

  if (!delivery.created) {
    return Response.json({
      deliveryId,
      message: "이미 수신한 GitHub 웹훅입니다.",
      status: delivery.status,
    });
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

  if (!repositoryFullName) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "GitHub repository 정보를 찾을 수 없습니다.",
      status: "FETCH_FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "GitHub repository 정보를 찾을 수 없습니다.",
      },
      { status: 400 },
    );
  }

  const readmeChanges = getReadmeChangesFromPushPayload(webhookPayload);

  if (readmeChanges.length === 0) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      status: "NO_README",
    });

    return Response.json({
      deliveryId,
      message: "README 변경이 없는 GitHub push 웹훅입니다.",
      readmeChanges,
      repository: repositoryFullName,
    });
  }

  const accessToken = await getRepositoryAccessToken(repositoryFullName);

  if (!accessToken) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
      status: "FETCH_FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
      },
      { status: 404 },
    );
  }

  try {
    await Promise.all(
      readmeChanges.map((change) =>
        fetchGitHubReadmeContent({
          accessToken,
          commitSha: change.commitSha,
          path: change.path,
          repositoryFullName,
        }),
      ),
    );
  } catch (error) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage:
        error instanceof Error ? error.message : "GitHub README 조회 실패",
      status: "FETCH_FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "GitHub README 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }

  return Response.json({
    deliveryId,
    message: "GitHub push 웹훅을 수신했습니다.",
    readmeChanges,
    repository: repositoryFullName,
  });
}

async function getRepositoryAccessToken(repositoryFullName: string) {
  const repositoryWebhook = await prisma.gitHubRepositoryWebhook.findUnique({
    select: {
      userId: true,
    },
    where: {
      repositoryFullName,
    },
  });

  if (!repositoryWebhook) {
    return null;
  }

  const account = await prisma.account.findFirst({
    select: {
      access_token: true,
    },
    where: {
      provider: "github",
      userId: repositoryWebhook.userId,
    },
  });

  return account?.access_token ?? null;
}

async function updateWebhookDeliveryStatus({
  deliveryId,
  errorMessage,
  status,
}: {
  deliveryId: string;
  errorMessage?: string;
  status:
    | "FETCH_FAILED"
    | "FAILED"
    | "IGNORED"
    | "NO_README"
    | "PARSE_FAILED"
    | "PROCESSED"
    | "RECEIVED";
}) {
  await prisma.webhookDelivery.update({
    data: {
      errorMessage,
      processedAt: new Date(),
      status,
    },
    where: {
      deliveryId,
    },
  });
}

async function saveWebhookDelivery({
  deliveryId,
  event,
  payload,
  repositoryFullName,
  status,
}: {
  deliveryId: string;
  event: string;
  payload: Prisma.InputJsonValue;
  repositoryFullName: string | null;
  status:
    | "FETCH_FAILED"
    | "FAILED"
    | "IGNORED"
    | "NO_README"
    | "PARSE_FAILED"
    | "PROCESSED"
    | "RECEIVED";
}) {
  const existingDelivery = await prisma.webhookDelivery.findUnique({
    select: {
      status: true,
    },
    where: {
      deliveryId,
    },
  });

  if (existingDelivery) {
    return {
      created: false,
      status: existingDelivery.status,
    };
  }

  const delivery = await prisma.webhookDelivery.create({
    data: {
      deliveryId,
      event,
      payload,
      repositoryFullName,
      status,
    },
    select: {
      status: true,
    },
  });

  return {
    created: true,
    status: delivery.status,
  };
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

