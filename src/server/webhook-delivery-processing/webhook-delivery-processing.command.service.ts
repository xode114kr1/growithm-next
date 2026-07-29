import "server-only";

import { fetchGitHubRawContent } from "@/server/webhook-delivery-processing/webhook-delivery-processing.gateway";
import {
  createProblemSubmission,
  getProblemFileChangeFromPushPayload,
  parseProblemMetadata,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.mapper";
import {
  claimWebhookDeliveryForProcessing,
  getRepositoryOwner,
  getWebhookDeliveryForProcessing,
  saveProblemSubmissionAndCompleteDelivery,
  updateWebhookDeliveryStatus,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.repository";
import type {
  GitHubProblemFileChange,
  GitHubWebhookPayload,
} from "@/types/github";
import { getProblemExperienceScore } from "@/utils/problem";

// 저장된 GitHub push delivery를 문제 제출 데이터로 처리한다.
export async function processGitHubWebhookDelivery(webhookDeliveryId: string) {
  try {
    // Command: 처리 가능한 GitHub push delivery 선점
    const delivery = await claimProcessablePushDelivery(webhookDeliveryId);

    if (!delivery) {
      return;
    }

    // Command: GitHub push delivery 처리
    await processGitHubPushDelivery({
      repositoryFullName: delivery.repositoryFullName,
      webhookDeliveryId,
      webhookPayload: delivery.payload as GitHubWebhookPayload,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "웹훅 Delivery 재시도 대기";

    // Repository: 재시도할 delivery 대기 상태 갱신
    await updateWebhookDeliveryStatus({
      errorMessage,
      status: "RETRY_PENDING",
      webhookDeliveryId,
    });

    throw error;
  }
}

// 처리 가능한 GitHub push delivery를 조회하고 처리 권한을 획득한다.
async function claimProcessablePushDelivery(webhookDeliveryId: string) {
  // Repository: 처리할 웹훅 delivery 조회
  const delivery = await getWebhookDeliveryForProcessing(webhookDeliveryId);

  if (
    !delivery ||
    delivery.status === "PROCESSED" ||
    delivery.event !== "push"
  ) {
    return null;
  }

  // Repository: 웹훅 delivery 처리 권한 획득
  const claimed = await claimWebhookDeliveryForProcessing(webhookDeliveryId);

  return claimed ? delivery : null;
}

// GitHub push delivery에서 변경된 문제 파일과 저장소 소유자를 확인한다.
async function processGitHubPushDelivery({
  repositoryFullName,
  webhookDeliveryId,
  webhookPayload,
}: {
  repositoryFullName: string | null;
  webhookDeliveryId: string;
  webhookPayload: GitHubWebhookPayload;
}) {
  if (!repositoryFullName) {
    // Repository: 저장소 정보가 없는 delivery 실패 상태 갱신
    await updateWebhookDeliveryStatus({
      errorMessage: "GitHub repository 정보를 찾을 수 없습니다.",
      status: "FAILED",
      webhookDeliveryId,
    });

    return;
  }

  // Mapper: GitHub push payload에서 변경된 문제 파일 추출
  const problemFileChange = getProblemFileChangeFromPushPayload(webhookPayload);

  if (!problemFileChange) {
    // Repository: 문제 파일 변경이 없는 delivery 완료 상태 갱신
    await updateWebhookDeliveryStatus({
      status: "PROCESSED",
      webhookDeliveryId,
    });

    return;
  }

  // Repository: 저장소 소유자 조회
  const repositoryOwner = await getRepositoryOwner(
    repositoryFullName,
    webhookPayload,
  );

  if (!repositoryOwner) {
    // Repository: 저장소 소유자 정보가 없는 delivery 실패 상태 갱신
    await updateWebhookDeliveryStatus({
      errorMessage: "Repository에 연결된 사용자를 찾을 수 없습니다.",
      status: "FAILED",
      webhookDeliveryId,
    });

    return;
  }

  // Command: 변경된 문제 파일 처리
  await processChangedProblemFile({
    problemFileChange,
    repositoryFullName,
    userId: repositoryOwner.userId,
    webhookDeliveryId,
  });
}

// 변경된 문제 파일을 조회하고 문제 제출 저장 결과에 따라 delivery를 완료한다.
async function processChangedProblemFile({
  problemFileChange,
  repositoryFullName,
  userId,
  webhookDeliveryId,
}: {
  problemFileChange: GitHubProblemFileChange;
  repositoryFullName: string;
  userId: string;
  webhookDeliveryId: string;
}) {
  // Command: 변경된 풀이 코드와 문제 정보 조회
  const [code, metadataText] = await Promise.all([
    fetchGitHubRawContent({
      commitSha: problemFileChange.commitSha,
      path: problemFileChange.codePath,
      repositoryFullName,
    }),
    fetchGitHubRawContent({
      commitSha: problemFileChange.commitSha,
      path: problemFileChange.metadataPath,
      repositoryFullName,
    }),
  ]);

  if (!metadataText) {
    // Repository: 문제 정보 조회에 실패한 delivery 상태 갱신
    await updateWebhookDeliveryStatus({
      errorMessage: "문제 정보를 조회할 수 없습니다.",
      status: "FAILED",
      webhookDeliveryId,
    });

    return;
  }

  // Mapper: 문제 정보 파일에서 제출 정보 추출
  const parsedMetadata = parseProblemMetadata(metadataText);

  if (!parsedMetadata) {
    const errorMessage = "문제 정보를 파싱할 수 없습니다.";

    // Repository: 문제 정보 파싱에 실패한 delivery 상태 갱신
    await updateWebhookDeliveryStatus({
      errorMessage,
      status: "FAILED",
      webhookDeliveryId,
    });

    return;
  }

  // Utils: 문제 경험치 점수 계산
  const experienceScore = getProblemExperienceScore({
    platform: parsedMetadata.platform,
    tier: parsedMetadata.tier,
  });

  // Mapper: 문제 제출 저장 데이터 생성
  const submission = createProblemSubmission({
    code,
    commitSha: problemFileChange.commitSha,
    metadataPath: problemFileChange.metadataPath,
    parsedMetadata,
    repositoryFullName,
    score: experienceScore,
    userId,
  });

  // Repository: 문제 제출 저장과 delivery 처리 완료
  await saveProblemSubmissionAndCompleteDelivery({
    submission,
    webhookDeliveryId,
  });
}
