import "server-only";

import { prisma } from "@/lib/prisma";
import { createGitHubWebhook } from "@/services/github/webhook-registration.helper.server";
import type { GitHubWebhookRequestBody } from "@/types/github";
import { parseRepository } from "@/utils/github-repository";

type RegisterGitHubWebhookResult =
  | {
      body: {
        hookId: number | null;
        message: string;
        repository: { owner: string; repo: string };
      };
      status?: never;
    }
  | {
      body: { message: string };
      status: number;
    };

// 사용자 저장소에 GitHub 웹훅을 등록하고 연결 정보를 저장한다.
export async function registerGitHubWebhook({
  body,
  userId,
}: {
  body: GitHubWebhookRequestBody;
  userId: string;
}): Promise<RegisterGitHubWebhookResult> {
  const webhookUrl = process.env.GITHUB_WEBHOOK_URL;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return {
      body: { message: "GitHub 웹훅 환경변수가 설정되지 않았습니다." },
      status: 500,
    };
  }

  const repository = parseRepository(body);

  if (!repository) {
    return {
      body: { message: "GitHub ID와 Repository 정보를 올바르게 입력해주세요." },
      status: 400,
    };
  }

  const account = await prisma.account.findFirst({
    select: {
      access_token: true,
    },
    where: {
      provider: "github",
      userId,
    },
  });

  if (!account?.access_token) {
    return {
      body: {
        message:
          "GitHub access token을 찾을 수 없습니다. GitHub로 다시 로그인해주세요.",
      },
      status: 401,
    };
  }

  const webhook = await createGitHubWebhook({
    accessToken: account.access_token,
    owner: repository.owner,
    repo: repository.repo,
    webhookSecret,
    webhookUrl,
  });

  if (!webhook.ok) {
    return {
      body: { message: webhook.message },
      status: webhook.status,
    };
  }

  const repositoryFullName = `${repository.owner}/${repository.repo}`;

  await prisma.gitHubRepositoryWebhook.upsert({
    create: {
      hookId: webhook.hookId,
      repositoryFullName,
      userId,
    },
    update: {
      hookId: webhook.hookId,
      userId,
    },
    where: {
      repositoryFullName,
    },
  });

  return {
    body: {
      hookId: webhook.hookId,
      message: "GitHub 웹훅 연결이 완료되었습니다.",
      repository,
    },
  };
}
