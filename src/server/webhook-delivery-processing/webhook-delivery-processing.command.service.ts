import "server-only";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import {
  fetchGitHubRawCode,
  fetchGitHubProblemMetadata,
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
import { isRetryableGitHubFileError } from "@/server/github/github.errors";
import type { GitHubReadmeChange, GitHubWebhookPayload } from "@/types/github";
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
      deliveryId: delivery.deliveryId,
      repositoryFullName: delivery.repositoryFullName,
      webhookDeliveryId,
      webhookPayload: delivery.payload as GitHubWebhookPayload,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "웹훅 Delivery 재시도 대기";

    // Repository: 재시도할 delivery 대기 상태 갱신
    await updateWebhookDeliveryStatusById({
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
  deliveryId,
  repositoryFullName,
  webhookDeliveryId,
  webhookPayload,
}: {
  deliveryId: string;
  repositoryFullName: string | null;
  webhookDeliveryId: string;
  webhookPayload: GitHubWebhookPayload;
}) {
  if (!repositoryFullName) {
    // Repository: 저장소 정보가 없는 delivery 실패 상태 갱신
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "GitHub repository 정보를 찾을 수 없습니다.",
      status: "FAILED",
    });

    return;
  }

  // Mapper: GitHub push payload에서 변경된 문제 파일 추출
  const problemFileChange = getProblemFileChangeFromPushPayload(webhookPayload);

  if (!problemFileChange) {
    // Repository: 문제 파일 변경이 없는 delivery 완료 상태 갱신
    await updateWebhookDeliveryStatus({
      deliveryId,
      status: "PROCESSED",
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
      deliveryId,
      errorMessage: "Repository에 연결된 사용자를 찾을 수 없습니다.",
      status: "FAILED",
    });

    return;
  }

  // Command: 변경된 문제 파일 처리
  await processChangedProblemFile({
    deliveryId,
    problemFileChange,
    repositoryFullName,
    userId: repositoryOwner.userId,
    webhookDeliveryId,
  });
}

// 변경된 문제 파일을 조회하고 문제 제출 저장 결과에 따라 delivery를 완료한다.
async function processChangedProblemFile({
  deliveryId,
  problemFileChange,
  repositoryFullName,
  userId,
  webhookDeliveryId,
}: {
  deliveryId: string;
  problemFileChange: GitHubReadmeChange;
  repositoryFullName: string;
  userId: string;
  webhookDeliveryId: string;
}) {
  // Command: 변경된 풀이 코드와 문제 정보 조회
  const [codeResult, metadataResult] = await Promise.all([
    fetchChangedCodeContent(problemFileChange, repositoryFullName),
    fetchChangedProblemMetadata({
      problemFileChange,
      repositoryFullName,
    }),
  ]);
  const retryableError =
    codeResult.retryableError ?? metadataResult.retryableError;

  if (retryableError) {
    throw retryableError;
  }

  if (!metadataResult.metadata) {
    // Repository: 문제 정보 조회에 실패한 delivery 상태 갱신
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "문제 정보를 조회할 수 없습니다.",
      status: "FAILED",
    });

    return;
  }

  // Mapper: README에서 문제 정보 추출
  const parsedReadme = parseProblemReadme(metadataResult.metadata.text);

  if (!parsedReadme) {
    const errorMessage = "README에서 문제 정보를 파싱할 수 없습니다.";

    // Repository: 문제 정보 파싱에 실패한 delivery 상태 갱신
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage,
      status: "FAILED",
    });

    return;
  }

  // Utils: 문제 경험치 점수 계산
  const experienceScore = getProblemExperienceScore({
    platform: parsedReadme.platform,
    tier: parsedReadme.tier,
  });

  // Repository: 문제 제출 저장과 delivery 처리 완료
  await saveProblemSubmissionAndCompleteDelivery({
    submission: {
      accuracy: parsedReadme.accuracy,
      categories: parsedReadme.categories,
      code: codeResult.code,
      commitSha: metadataResult.metadata.commitSha,
      description: parsedReadme.description,
      link: parsedReadme.link,
      memory: parsedReadme.memory,
      platform: parsedReadme.platform,
      problemId: parsedReadme.problemId,
      readmePath: metadataResult.metadata.path,
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
}

// 변경된 풀이 코드 파일을 조회한다.
async function fetchChangedCodeContent(
  problemFileChange: GitHubReadmeChange,
  repositoryFullName: string,
) {
  if (!problemFileChange.codePath) {
    return { code: null, retryableError: null };
  }

  // Mapper: 변경된 풀이 코드의 GitHub 원본 URL 생성
  const codeUrl = buildRawGitHubContentUrl({
    commitSha: problemFileChange.commitSha,
    path: problemFileChange.codePath,
    repositoryFullName,
  });

  try {
    // Gateway: GitHub에서 변경된 풀이 코드 조회
    const result = await fetchGitHubRawCode(codeUrl);

    return { code: result.code, retryableError: null };
  } catch (error) {
    // Error: GitHub 파일 조회 오류의 재시도 가능 여부 확인
    return {
      code: null,
      retryableError: isRetryableGitHubFileError(error) ? error : null,
    };
  }
}

// 변경된 문제 정보 파일을 조회한다.
async function fetchChangedProblemMetadata({
  problemFileChange,
  repositoryFullName,
}: {
  problemFileChange: GitHubReadmeChange;
  repositoryFullName: string;
}) {
  try {
    // Gateway: GitHub에서 변경된 문제 정보 조회
    const metadata = await fetchGitHubProblemMetadata({
      commitSha: problemFileChange.commitSha,
      path: problemFileChange.readmePath,
      repositoryFullName,
    });

    return { metadata, retryableError: null };
  } catch (error) {
    // Error: GitHub 파일 조회 오류의 재시도 가능 여부 확인
    return {
      metadata: null,
      retryableError: isRetryableGitHubFileError(error) ? error : null,
    };
  }
}
