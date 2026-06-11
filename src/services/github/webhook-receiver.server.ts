import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import {
  fetchGitHubReadmeContent,
} from "@/services/github/readme.server";
import type {
  GitHubReadmeContent,
  GitHubWebhookPayload,
} from "@/types/github";
import {
  getReadmeChangesFromPushPayload,
  getRepositoryOwnerId,
  getRepositoryFullName,
} from "@/utils/github-webhook";
import { prisma } from "@/lib/prisma";
import { parseProblemReadme } from "@/utils/problem-readme";
import { getProblemExperienceScore } from "@/utils/problem";

const signaturePrefix = "sha256=";

type GitHubCodeContent = {
  code: string | null;
  readmePath: string;
};

// GitHub 웹훅 요청을 검증하고 문제 제출 데이터로 처리한다.
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

  const codeContents = await Promise.all(
    readmeChanges.map(async (change) => {
      if (!change.codePath) {
        return {
          code: null,
          codePath: null,
          codeUrl: null,
          readmePath: change.path,
          status: null,
        };
      }

      const codeUrl = buildRawGitHubContentUrl({
        commitSha: change.commitSha,
        path: change.codePath,
        repositoryFullName,
      });
      const response = await fetch(codeUrl);

      return {
        code: response.ok ? await response.text() : null,
        codePath: change.codePath,
        codeUrl,
        readmePath: change.path,
        status: response.status,
      };
    }),
  );

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

  const repositoryOwner = await getRepositoryOwner(
    repositoryFullName,
    webhookPayload,
  );

  if (!repositoryOwner) {
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

  let readmes: GitHubReadmeContent[];

  try {
    readmes = await Promise.all(
      readmeChanges.map((change) =>
        fetchGitHubReadmeContent({
          accessToken: repositoryOwner.accessToken,
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

  const result = await saveProblemSubmissions({
    codeContents,
    webhookDeliveryId: delivery.id,
    readmes,
    repositoryFullName,
    userId: repositoryOwner.userId,
  });

  if (result.savedCount === 0) {
    await updateWebhookDeliveryStatus({
      deliveryId,
      errorMessage: "파싱 가능한 README를 찾을 수 없습니다.",
      status: "PARSE_FAILED",
    });

    return Response.json(
      {
        deliveryId,
        message: "파싱 가능한 README를 찾을 수 없습니다.",
        parseFailedCount: result.parseFailedCount,
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
    parseFailedCount: result.parseFailedCount,
    readmeChanges,
    repository: repositoryFullName,
    savedCount: result.savedCount,
  });
}

// 저장된 웹훅 정보와 payload를 사용해 저장소 소유 사용자를 찾는다.
async function getRepositoryOwner(
  repositoryFullName: string,
  payload: GitHubWebhookPayload,
) {
  const repositoryWebhook = await prisma.gitHubRepositoryWebhook.findUnique({
    select: {
      userId: true,
    },
    where: {
      repositoryFullName,
    },
  });

  if (!repositoryWebhook) {
    return getRepositoryOwnerFromPayload(repositoryFullName, payload);
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

  if (!account?.access_token) {
    return null;
  }

  return {
    accessToken: account.access_token,
    userId: repositoryWebhook.userId,
  };
}

// 웹훅 payload의 GitHub 소유자 ID로 연결된 사용자를 찾는다.
async function getRepositoryOwnerFromPayload(
  repositoryFullName: string,
  payload: GitHubWebhookPayload,
) {
  const ownerId = getRepositoryOwnerId(payload);

  if (!ownerId) {
    return null;
  }

  const account = await prisma.account.findFirst({
    select: {
      access_token: true,
      userId: true,
    },
    where: {
      provider: "github",
      providerAccountId: ownerId,
    },
  });

  if (!account?.access_token) {
    return null;
  }

  await prisma.gitHubRepositoryWebhook.upsert({
    create: {
      repositoryFullName,
      userId: account.userId,
    },
    update: {
      userId: account.userId,
    },
    where: {
      repositoryFullName,
    },
  });

  return {
    accessToken: account.access_token,
    userId: account.userId,
  };
}

// README와 코드 내용을 문제 제출 데이터로 저장하고 점수를 반영한다.
async function saveProblemSubmissions({
  codeContents,
  readmes,
  repositoryFullName,
  userId,
  webhookDeliveryId,
}: {
  codeContents: GitHubCodeContent[];
  readmes: GitHubReadmeContent[];
  repositoryFullName: string;
  userId: string;
  webhookDeliveryId: string;
}) {
  let parseFailedCount = 0;
  let savedCount = 0;

  for (const readme of readmes) {
    const parsedReadme = parseProblemReadme(readme.text);
    const code =
      codeContents.find((codeContent) => codeContent.readmePath === readme.path)
        ?.code ?? null;

    if (!parsedReadme) {
      parseFailedCount += 1;
      continue;
    }

    const experienceScore = getProblemExperienceScore({
      platform: parsedReadme.platform,
      tier: parsedReadme.tier,
    });

    await prisma.$transaction(async (tx) => {
      const existingSubmission = await tx.problemSubmission.findUnique({
        select: {
          score: true,
        },
        where: {
          repositoryFullName_commitSha_readmePath: {
            commitSha: readme.commitSha,
            readmePath: readme.path,
            repositoryFullName,
          },
        },
      });

      await tx.problemSubmission.upsert({
        create: {
          accuracy: parsedReadme.accuracy,
          code,
          categories: parsedReadme.categories,
          commitSha: readme.commitSha,
          description: parsedReadme.description,
          link: parsedReadme.link,
          memory: parsedReadme.memory,
          platform: parsedReadme.platform,
          problemId: parsedReadme.problemId,
          readmePath: readme.path,
          repositoryFullName,
          score: experienceScore,
          scoreMax: parsedReadme.scoreMax,
          status: ProblemSubmissionStatus.PENDING,
          submittedAtText: parsedReadme.submittedAtText,
          tier: parsedReadme.tier,
          time: parsedReadme.time,
          title: parsedReadme.title,
          userId,
          webhookDeliveryId,
        },
        update: {
          accuracy: parsedReadme.accuracy,
          code,
          categories: parsedReadme.categories,
          description: parsedReadme.description,
          link: parsedReadme.link,
          memory: parsedReadme.memory,
          platform: parsedReadme.platform,
          problemId: parsedReadme.problemId,
          score: experienceScore,
          scoreMax: parsedReadme.scoreMax,
          status: ProblemSubmissionStatus.PENDING,
          submittedAtText: parsedReadme.submittedAtText,
          tier: parsedReadme.tier,
          time: parsedReadme.time,
          title: parsedReadme.title,
          userId,
          webhookDeliveryId,
        },
        where: {
          repositoryFullName_commitSha_readmePath: {
            commitSha: readme.commitSha,
            readmePath: readme.path,
            repositoryFullName,
          },
        },
      });

      const scoreDelta = experienceScore - (existingSubmission?.score ?? 0);

      if (scoreDelta !== 0) {
        await tx.user.update({
          data: {
            score: {
              increment: scoreDelta,
            },
          },
          where: {
            id: userId,
          },
        });
      }
    });

    savedCount += 1;
  }

  return {
    parseFailedCount,
    savedCount,
  };
}

// 저장된 웹훅 delivery의 처리 상태와 오류를 갱신한다.
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

// 웹훅 delivery를 중복 없이 저장하고 처리 가능 상태를 반환한다.
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
      id: true,
      status: true,
    },
    where: {
      deliveryId,
    },
  });

  if (existingDelivery) {
    if (isRetryableDeliveryStatus(existingDelivery.status)) {
      await prisma.webhookDelivery.update({
        data: {
          errorMessage: null,
          event,
          payload,
          processedAt: null,
          repositoryFullName,
          status,
        },
        where: {
          deliveryId,
        },
      });

      return {
        created: true,
        id: existingDelivery.id,
        status,
      };
    }

    return {
      created: false,
      id: existingDelivery.id,
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
      id: true,
      status: true,
    },
  });

  return {
    created: true,
    id: delivery.id,
    status: delivery.status,
  };
}

// 웹훅 처리 상태가 재시도 가능한 상태인지 확인한다.
function isRetryableDeliveryStatus(status: string) {
  return (
    status === "FAILED" ||
    status === "FETCH_FAILED" ||
    status === "PARSE_FAILED"
  );
}

// 커밋과 파일 경로를 사용해 GitHub 원본 파일 URL을 만든다.
function buildRawGitHubContentUrl({
  commitSha,
  path,
  repositoryFullName,
}: {
  commitSha: string;
  path: string;
  repositoryFullName: string;
}) {
  return `https://raw.githubusercontent.com/${repositoryFullName}/${commitSha}/${encodeGitHubPath(path)}`;
}

// GitHub API 요청에 사용할 파일 경로의 각 구간을 인코딩한다.
function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

// 요청 본문과 시크릿으로 GitHub 웹훅 서명을 검증한다.
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

