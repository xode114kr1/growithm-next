import "server-only";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
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
import { isRetryableGitHubFileError } from "@/server/github/github.errors";
import type { GitHubReadmeChange, GitHubWebhookPayload } from "@/types/github";
import { getProblemExperienceScore } from "@/utils/problem";

type WebhookDeliveryProcessingResult = {
  deliveryId?: string;
  message: string;
  problemFileChange?: GitHubReadmeChange;
  repository?: string;
};

// 저장된 GitHub push delivery를 문제 제출 데이터로 처리한다.
export async function processGitHubWebhookDelivery(
  webhookDeliveryId: string,
): Promise<WebhookDeliveryProcessingResult> {
  try {
    // Repository: 처리할 웹훅 delivery 조회
    const delivery = await getWebhookDeliveryForProcessing(webhookDeliveryId);

    if (!delivery) {
      return {
        message: "처리할 GitHub 웹훅 delivery를 찾을 수 없습니다.",
      };
    }

    if (delivery.status === "PROCESSED") {
      return {
        deliveryId: delivery.deliveryId,
        message: "이미 처리한 GitHub 웹훅 delivery입니다.",
      };
    }

    if (delivery.event !== "push") {
      return {
        deliveryId: delivery.deliveryId,
        message: "처리 대상이 아닌 GitHub 웹훅 이벤트입니다.",
      };
    }

    const deliveryId = delivery.deliveryId;

    // Repository: 웹훅 delivery 처리 권한 획득
    const claimed = await claimWebhookDeliveryForProcessing(webhookDeliveryId);

    if (!claimed) {
      return {
        deliveryId,
        message:
          "다른 Consumer가 이미 처리 중이거나 처리를 완료한 delivery입니다.",
      };
    }

    const webhookPayload = delivery.payload as GitHubWebhookPayload;
    const repositoryFullName = delivery.repositoryFullName;

    if (!repositoryFullName) {
      // Repository: 저장소 정보가 없는 delivery 실패 상태 갱신
      await updateWebhookDeliveryStatus({
        deliveryId,
        errorMessage: "GitHub repository 정보를 찾을 수 없습니다.",
        status: "FAILED",
      });

      return {
        deliveryId,
        message: "GitHub repository 정보를 찾을 수 없습니다.",
      };
    }

    // Mapper: GitHub push payload에서 변경된 문제 파일 추출
    const problemFileChange =
      getProblemFileChangeFromPushPayload(webhookPayload);

    if (!problemFileChange) {
      // Repository: 문제 파일 변경이 없는 delivery 완료 상태 갱신
      await updateWebhookDeliveryStatus({
        deliveryId,
        status: "PROCESSED",
      });

      return {
        deliveryId,
        message: "README 변경이 없는 GitHub push 웹훅입니다.",
        repository: repositoryFullName,
      };
    }

    // Repository: 저장소 소유자와 GitHub access token 조회
    const repositoryOwner = await getRepositoryOwner(
      repositoryFullName,
      webhookPayload,
    );

    if (!repositoryOwner) {
      // Repository: 저장소 소유자 정보가 없는 delivery 실패 상태 갱신
      await updateWebhookDeliveryStatus({
        deliveryId,
        errorMessage:
          "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
        status: "FAILED",
      });

      return {
        deliveryId,
        message:
          "Repository에 연결된 GitHub access token을 찾을 수 없습니다.",
      };
    }

    // Command: 변경된 문제 파일 처리
    return processChangedProblemFile({
      accessToken: repositoryOwner.accessToken,
      deliveryId,
      problemFileChange,
      repositoryFullName,
      userId: repositoryOwner.userId,
      webhookDeliveryId,
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
  // Command: 변경된 풀이 코드와 README 조회
  const [codeResult, readmeResult] = await Promise.all([
    fetchChangedCodeContent(problemFileChange, repositoryFullName),
    fetchChangedReadme({
      accessToken,
      problemFileChange,
      repositoryFullName,
    }),
  ]);
  const retryableError =
    codeResult.retryableError ?? readmeResult.retryableError;

  if (retryableError) {
    throw retryableError;
  }

  if (!readmeResult.readme) {
    // Repository: README 조회에 실패한 delivery 상태 갱신
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "README를 조회할 수 없습니다.",
      status: "FAILED",
    });

    return {
      deliveryId,
      message: "README를 조회할 수 없습니다.",
    };
  }

  // Mapper: README에서 문제 정보 추출
  const parsedReadme = parseProblemReadme(readmeResult.readme.text);

  if (!parsedReadme) {
    const errorMessage = "README에서 문제 정보를 파싱할 수 없습니다.";

    // Repository: 문제 정보 파싱에 실패한 delivery 상태 갱신
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage,
      status: "FAILED",
    });

    return {
      deliveryId,
      message: errorMessage,
    };
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
    // Gateway: GitHub에서 변경된 README 조회
    const readme = await fetchGitHubReadmeContent({
      accessToken,
      commitSha: problemFileChange.commitSha,
      path: problemFileChange.path,
      repositoryFullName,
    });

    return { readme, retryableError: null };
  } catch (error) {
    // Error: GitHub 파일 조회 오류의 재시도 가능 여부 확인
    return {
      readme: null,
      retryableError: isRetryableGitHubFileError(error) ? error : null,
    };
  }
}
