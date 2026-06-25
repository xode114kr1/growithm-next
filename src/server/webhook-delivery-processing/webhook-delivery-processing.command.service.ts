import "server-only";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { getProblemExperienceScore } from "@/server/problems/problem.command.service";
import {
  fetchGitHubRawCode,
  fetchGitHubReadmeContent,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.gateway";
import {
  buildRawGitHubContentUrl,
  getProblemFileChangeFromPushPayload,
  parseProblemReadme,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.mapper";
import {
  claimWebhookDeliveryForProcessing,
  getRepositoryOwner,
  getWebhookDeliveryForProcessing,
  saveProblemSubmissionAndCompleteDelivery,
  updateWebhookDeliveryStatus,
  updateWebhookDeliveryStatusById,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.repository";
import { getRepositoryFullName } from "@/server/github/github-webhook.helper";
import { isRetryableGitHubFileError } from "@/server/github/github-file.error";
import type { GitHubReadmeChange, GitHubWebhookPayload } from "@/types/github";

type WebhookDeliveryProcessingResult = {
  deliveryId?: string;
  message: string;
  problemFileChange?: GitHubReadmeChange;
  repository?: string;
  status:
    | "ALREADY_PROCESSED"
    | "CLAIM_SKIPPED"
    | "INVALID_EVENT"
    | "INVALID_REPOSITORY"
    | "NOT_FOUND"
    | "NO_PROBLEM_CHANGE"
    | "PARSE_FAILED"
    | "PROCESSED"
    | "README_FETCH_FAILED"
    | "REPOSITORY_OWNER_NOT_FOUND";
};

// 저장된 GitHub push delivery를 문제 제출 데이터로 처리한다.
export async function processGitHubWebhookDelivery(
  webhookDeliveryId: string,
): Promise<WebhookDeliveryProcessingResult> {
  try {
    return await processGitHubWebhookDeliveryCommand(webhookDeliveryId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "웹훅 Delivery 재시도 대기";

    await updateWebhookDeliveryStatusById({
      errorMessage,
      status: "RETRY_PENDING",
      webhookDeliveryId,
    });

    throw error;
  }
}

// 저장된 GitHub push delivery의 처리 흐름을 실행한다.
async function processGitHubWebhookDeliveryCommand(
  webhookDeliveryId: string,
): Promise<WebhookDeliveryProcessingResult> {
  const delivery = await getWebhookDeliveryForProcessing(webhookDeliveryId);

  if (!delivery) {
    return {
      message: "처리할 GitHub 웹훅 delivery를 찾을 수 없습니다.",
      status: "NOT_FOUND",
    };
  }

  if (delivery.status === "PROCESSED") {
    return {
      deliveryId: delivery.deliveryId,
      message: "이미 처리한 GitHub 웹훅 delivery입니다.",
      status: "ALREADY_PROCESSED",
    };
  }

  if (delivery.event !== "push") {
    return {
      deliveryId: delivery.deliveryId,
      message: "처리 대상이 아닌 GitHub 웹훅 이벤트입니다.",
      status: "INVALID_EVENT",
    };
  }

  const deliveryId = delivery.deliveryId;
  const claimed = await claimWebhookDeliveryForProcessing(webhookDeliveryId);

  if (!claimed) {
    return {
      deliveryId,
      message: "다른 Consumer가 이미 처리 중이거나 처리를 완료한 delivery입니다.",
      status: "CLAIM_SKIPPED",
    };
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

    return {
      deliveryId,
      message: "GitHub repository 정보를 찾을 수 없습니다.",
      status: "INVALID_REPOSITORY",
    };
  }

  const problemFileChange = getProblemFileChangeFromPushPayload(webhookPayload);

  if (!problemFileChange) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      status: "PROCESSED",
    });

    return {
      deliveryId,
      message: "README 변경이 없는 GitHub push 웹훅입니다.",
      repository: repositoryFullName,
      status: "NO_PROBLEM_CHANGE",
    };
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

    return {
      deliveryId,
      message: "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
      status: "REPOSITORY_OWNER_NOT_FOUND",
    };
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

    return {
      deliveryId,
      message: "README를 조회할 수 없습니다.",
      status: "README_FETCH_FAILED" as const,
    };
  }

  const parsedReadme = parseProblemReadme(readmeResult.readme.text);

  if (!parsedReadme) {
    const errorMessage = "README에서 문제 정보를 파싱할 수 없습니다.";

    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage,
      status: "FAILED",
    });

    return {
      deliveryId,
      message: errorMessage,
      status: "PARSE_FAILED" as const,
    };
  }

  const experienceScore = getProblemExperienceScore({
    platform: parsedReadme.platform,
    tier: parsedReadme.tier,
  });

  await saveProblemSubmissionAndCompleteDelivery({
    submission: {
      accuracy: parsedReadme.accuracy,
      categories: parsedReadme.categories,
      code: codeResult.code,
      commitSha: readmeResult.readme.commitSha,
      description: parsedReadme.description,
      link: parsedReadme.link,
      memory: parsedReadme.memory,
      platform: parsedReadme.platform,
      problemId: parsedReadme.problemId,
      readmePath: readmeResult.readme.path,
      repositoryFullName,
      score: experienceScore,
      scoreMax: parsedReadme.scoreMax,
      status: ProblemSubmissionStatus.PENDING,
      submittedAtText: parsedReadme.submittedAtText,
      tier: parsedReadme.tier,
      time: parsedReadme.time,
      title: parsedReadme.title,
      userId,
    },
    webhookDeliveryId,
  });

  return {
    deliveryId,
    message: "GitHub push 웹훅 처리가 완료되었습니다.",
    problemFileChange,
    repository: repositoryFullName,
    status: "PROCESSED" as const,
  };
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
