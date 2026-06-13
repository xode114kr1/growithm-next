import "server-only";

import {
  claimWebhookDeliveryForProcessing,
  getRepositoryOwner,
  getWebhookDeliveryForProcessing,
  saveProblemSubmission,
  updateWebhookDeliveryStatus,
} from "@/services/webhook-delivery-processing/webhook-delivery-processing.persistence.server";
import { isRetryableGitHubFileError } from "@/services/github/github-file.error";
import { fetchGitHubReadmeContent } from "@/services/readme/readme.server";
import { fetchGitHubRawCode } from "@/services/webhook-receiver/webhook-receiver.client";
import {
  buildRawGitHubContentUrl,
  getProblemFileChangeFromPushPayload,
  getRepositoryFullName,
} from "@/services/webhook-receiver/webhook-receiver.helper";
import type { GitHubReadmeChange, GitHubWebhookPayload } from "@/types/github";

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
  const claimed = await claimWebhookDeliveryForProcessing(webhookDeliveryId);

  if (!claimed) {
    return Response.json({
      deliveryId,
      message: "다른 Consumer가 이미 처리 중이거나 처리를 완료한 delivery입니다.",
      status: delivery.status,
    });
  }

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
