import "server-only";

import {
  fetchGitHubWebhooks,
  postGitHubWebhook,
} from "@/server/webhook-registration/webhook-registration.gateway";
import {
  findGitHubAccessToken,
  upsertGitHubRepositoryWebhook,
} from "@/server/webhook-registration/webhook-registration.repository";
import { parseRepository } from "@/server/webhook-registration/webhook-registration.schema";
import type { GitHubWebhookRequestBody } from "@/types/github";

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

  const account = await findGitHubAccessToken(userId);

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

  await upsertGitHubRepositoryWebhook({
    hookId: webhook.hookId,
    repositoryFullName,
    userId,
  });

  return {
    body: {
      hookId: webhook.hookId,
      message: "GitHub 웹훅 연결이 완료되었습니다.",
      repository,
    },
  };
}

// 저장소에 기존 웹훅이 없으면 새 GitHub 웹훅을 생성한다.
async function createGitHubWebhook({
  accessToken,
  owner,
  repo,
  webhookSecret,
  webhookUrl,
}: {
  accessToken: string;
  owner: string;
  repo: string;
  webhookSecret: string;
  webhookUrl: string;
}) {
  const listResult = await fetchGitHubWebhooks({ accessToken, owner, repo });

  if (!listResult.ok) {
    return listResult;
  }

  const existingWebhook = listResult.webhooks.find(
    (webhook) => webhook.url === webhookUrl,
  );
  const existingHookId = existingWebhook?.hookId ?? null;

  if (existingHookId !== null) {
    return { hookId: existingHookId, ok: true as const };
  }

  return postGitHubWebhook({
    accessToken,
    owner,
    repo,
    webhookSecret,
    webhookUrl,
  });
}
