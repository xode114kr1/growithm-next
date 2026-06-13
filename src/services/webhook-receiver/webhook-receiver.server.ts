import "server-only";

import { queue, WEBHOOK_DELIVERY_QUEUE_TOPIC } from "@/lib/queue";
import { fetchGitHubReadmeContent } from "@/services/readme/readme.server";
import { isRetryableGitHubFileError } from "@/services/github/github-file.error";
import { fetchGitHubRawCode } from "@/services/webhook-receiver/webhook-receiver.client";
import {
  getWebhookDeliveryForProcessing,
  getRepositoryOwner,
  saveProblemSubmission,
  saveWebhookDelivery,
  updateWebhookDeliveryStatus,
} from "@/services/webhook-receiver/webhook-receiver.persistence.server";
import type { GitHubReadmeChange, GitHubWebhookPayload } from "@/types/github";
import {
  getProblemFileChangeFromPushPayload,
  getRepositoryFullName,
  buildRawGitHubContentUrl,
} from "@/services/webhook-receiver/webhook-receiver.helper";
import {
  isValidGitHubWebhookSignature,
  parseGitHubWebhookPayload,
} from "@/services/webhook-receiver/webhook-receiver.validator";
import type { WebhookDeliveryQueueMessage } from "@/types/queue";

// GitHub 웹훅 요청을 검증하고 delivery를 저장한다.
export async function receiveGitHubWebhook(request: Request) {
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

  if (!isValidGitHubWebhookSignature(rawBody, signature, webhookSecret)) {
    return Response.json(
      { message: "GitHub 웹훅 서명이 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const payload = parseGitHubWebhookPayload(rawBody);

  if (!payload) {
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

  let queueMessageId: string | null;

  console.info("[WebhookQueue] publish.started", {
    deliveryId,
    webhookDeliveryId: delivery.id,
  });

  try {
    queueMessageId = await enqueueWebhookDelivery(delivery.id);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Vercel Queue 발행 실패";

    console.error("[WebhookQueue] publish.failed", {
      deliveryId,
      errorMessage,
      webhookDeliveryId: delivery.id,
    });

    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage,
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "GitHub 웹훅 처리 작업 등록에 실패했습니다.",
        status: "FAILED",
        webhookDeliveryId: delivery.id,
      },
      { status: 503 },
    );
  }

  await updateWebhookDeliveryStatus({
    deliveryId,
    status: "QUEUED",
  });

  console.info("[WebhookQueue] publish.succeeded", {
    deliveryId,
    queueMessageId,
    webhookDeliveryId: delivery.id,
  });

  return Response.json(
    {
      deliveryId,
      message: "GitHub push 웹훅을 수신했습니다.",
      queueMessageId,
      status: "QUEUED",
      webhookDeliveryId: delivery.id,
    },
    { status: 202 },
  );
}

// 저장된 웹훅 delivery의 문제 처리 작업을 Queue에 발행한다.
export async function enqueueWebhookDelivery(webhookDeliveryId: string) {
  const message: WebhookDeliveryQueueMessage = { webhookDeliveryId };
  const result = await queue.send(WEBHOOK_DELIVERY_QUEUE_TOPIC, message, {
    idempotencyKey: webhookDeliveryId,
  });

  return result.messageId;
}

// 저장된 GitHub push delivery를 문제 제출 데이터로 처리한다.
export async function processGitHubWebhookDelivery(webhookDeliveryId: string) {
  const delivery = await getWebhookDeliveryForProcessing(webhookDeliveryId);

  if (!delivery) {
    return Response.json(
      { message: "처리할 GitHub 웹훅 delivery를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (delivery.status === "PROCESSED") {
    return Response.json({
      deliveryId: delivery.deliveryId,
      message: "이미 처리한 GitHub 웹훅 delivery입니다.",
    });
  }

  if (delivery.event !== "push") {
    return Response.json(
      {
        deliveryId: delivery.deliveryId,
        message: "처리 대상이 아닌 GitHub 웹훅 이벤트입니다.",
      },
      { status: 400 },
    );
  }

  const deliveryId = delivery.deliveryId;
  await updateWebhookDeliveryStatus({
    deliveryId,
    status: "PROCESSING",
  });

  const webhookPayload = delivery.payload as GitHubWebhookPayload;
  const repositoryFullName =
    delivery.repositoryFullName ?? getRepositoryFullName(webhookPayload);

  if (!repositoryFullName) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "GitHub repository 정보를 찾을 수 없습니다.",
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "GitHub repository 정보를 찾을 수 없습니다.",
      },
      { status: 400 },
    );
  }

  const problemFileChange = getProblemFileChangeFromPushPayload(webhookPayload);

  if (!problemFileChange) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      status: "PROCESSED",
    });

    return Response.json({
      deliveryId,
      message: "README 변경이 없는 GitHub push 웹훅입니다.",
      repository: repositoryFullName,
    });
  }

  const repositoryOwner = await getRepositoryOwner(
    repositoryFullName,
    webhookPayload,
  );

  if (!repositoryOwner) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage:
        "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
      },
      { status: 404 },
    );
  }

  return processChangedProblemFile({
    accessToken: repositoryOwner.accessToken,
    deliveryId,
    problemFileChange,
    repositoryFullName,
    userId: repositoryOwner.userId,
    webhookDeliveryId,
  });
}

// 변경된 문제 파일을 조회하고 문제 제출 저장 결과에 따라 delivery를 완료한다.
async function processChangedProblemFile({
  accessToken,
  deliveryId,
  problemFileChange,
  repositoryFullName,
  userId,
  webhookDeliveryId,
}: {
  accessToken: string;
  deliveryId: string;
  problemFileChange: GitHubReadmeChange;
  repositoryFullName: string;
  userId: string;
  webhookDeliveryId: string;
}) {
  const [codeResult, readmeResult] = await Promise.all([
    fetchChangedCodeContent(problemFileChange, repositoryFullName),
    fetchChangedReadme({
      accessToken,
      problemFileChange,
      repositoryFullName,
    }),
  ]);
  const retryableError = codeResult.retryableError ?? readmeResult.retryableError;

  if (retryableError) {
    throw retryableError;
  }

  if (!readmeResult.readme) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "README를 조회할 수 없습니다.",
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "README를 조회할 수 없습니다.",
      },
      { status: 422 },
    );
  }

  const result = await saveProblemSubmission({
    code: codeResult.code,
    readme: readmeResult.readme,
    repositoryFullName,
    userId,
    webhookDeliveryId,
  });

  if (!result.saved) {
    const errorMessage = "README에서 문제 정보를 파싱할 수 없습니다.";

    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage,
      status: "FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: errorMessage,
      },
      { status: 422 },
    );
  }

  await updateWebhookDeliveryStatus({
    deliveryId,
    status: "PROCESSED",
  });

  return Response.json({
    deliveryId,
    message: "GitHub push 웹훅 처리가 완료되었습니다.",
    problemFileChange,
    repository: repositoryFullName,
  });
}

// 변경된 풀이 코드 파일을 조회한다.
async function fetchChangedCodeContent(
  problemFileChange: GitHubReadmeChange,
  repositoryFullName: string,
) {
  if (!problemFileChange.codePath) {
    return { code: null, retryableError: null };
  }

  const codeUrl = buildRawGitHubContentUrl({
    commitSha: problemFileChange.commitSha,
    path: problemFileChange.codePath,
    repositoryFullName,
  });

  try {
    const result = await fetchGitHubRawCode(codeUrl);

    return { code: result.code, retryableError: null };
  } catch (error) {
    return {
      code: null,
      retryableError: isRetryableGitHubFileError(error) ? error : null,
    };
  }
}

// 변경된 README 파일을 조회한다.
async function fetchChangedReadme({
  accessToken,
  problemFileChange,
  repositoryFullName,
}: {
  accessToken: string;
  problemFileChange: GitHubReadmeChange;
  repositoryFullName: string;
}) {
  try {
    const readme = await fetchGitHubReadmeContent({
      accessToken,
      commitSha: problemFileChange.commitSha,
      path: problemFileChange.path,
      repositoryFullName,
    });

    return { readme, retryableError: null };
  } catch (error) {
    return {
      readme: null,
      retryableError: isRetryableGitHubFileError(error) ? error : null,
    };
  }
}
