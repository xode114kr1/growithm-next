import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Queue 발행 후 아직 대기 중인 delivery만 QUEUED 상태로 전환한다.
export async function markWebhookDeliveryQueued(deliveryId: string) {
  await prisma.webhookDelivery.updateMany({
    data: { status: "QUEUED" },
    where: {
      deliveryId,
      status: "RECEIVED",
    },
  });
}

// Queue 발행에 실패한 웹훅 delivery를 실패 상태로 갱신한다.
export async function markWebhookDeliveryFailed({
  deliveryId,
  errorMessage,
}: {
  deliveryId: string;
  errorMessage: string;
}) {
  await prisma.webhookDelivery.update({
    data: {
      errorMessage,
      processedAt: new Date(),
      status: "FAILED",
    },
    where: { deliveryId },
  });
}

// 웹훅 delivery를 중복 없이 저장하고 처리 가능 상태를 반환한다.
export async function saveWebhookDelivery({
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
  status: WebhookDeliveryStatus;
}) {
  try {
    const delivery = await prisma.webhookDelivery.create({
      data: { deliveryId, event, payload, repositoryFullName, status },
      select: { id: true, status: true },
    });

    return { created: true, id: delivery.id, status: delivery.status };
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }
  }

  const existingDelivery = await prisma.webhookDelivery.findUniqueOrThrow({
    select: { id: true, status: true },
    where: { deliveryId },
  });

  if (isRetryableDeliveryStatus(existingDelivery.status)) {
    const retriedDelivery = await prisma.webhookDelivery.updateMany({
      data: {
        errorMessage: null,
        event,
        payload,
        processedAt: null,
        repositoryFullName,
        status,
      },
      where: { deliveryId, status: "FAILED" },
    });

    if (retriedDelivery.count === 1) {
      return { created: true, id: existingDelivery.id, status };
    }
  }

  const currentDelivery = await prisma.webhookDelivery.findUniqueOrThrow({
    select: { id: true, status: true },
    where: { deliveryId },
  });

  return {
    created: false,
    id: currentDelivery.id,
    status: currentDelivery.status,
  };
}

type WebhookDeliveryStatus =
  | "FAILED"
  | "IGNORED"
  | "RECEIVED";

// 웹훅 처리 상태가 재시도 가능한 상태인지 확인한다.
function isRetryableDeliveryStatus(status: string) {
  return status === "FAILED";
}
