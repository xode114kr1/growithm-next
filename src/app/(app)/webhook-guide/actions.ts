"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { registerGitHubWebhook } from "@/server/webhook-registration/webhook-registration.command.service";
import type { ActionState } from "@/types/action-state";

export type RegisterGitHubWebhookActionState = ActionState & {
  githubId: string;
  message: string | null;
  repositoryName: string;
};

export async function registerGitHubWebhookAction(
  _prevState: RegisterGitHubWebhookActionState,
  formData: FormData,
): Promise<RegisterGitHubWebhookActionState> {
  const githubId = getFormValue(formData, "githubId").trim();
  const repositoryName = getFormValue(formData, "repositoryName").trim();

  if (!githubId || !repositoryName) {
    return createErrorState({
      error: "깃허브 ID와 Repository 이름을 모두 입력해주세요.",
      githubId,
      repositoryName,
    });
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return createErrorState({
      error: "로그인이 필요합니다.",
      githubId,
      repositoryName,
    });
  }

  const result = await registerGitHubWebhook({
    body: { owner: githubId, repo: repositoryName },
    userId,
  });

  if ("status" in result) {
    return createErrorState({
      error: result.body.message,
      githubId,
      repositoryName,
    });
  }

  redirect("/dashboard");
}

function createErrorState({
  error,
  githubId,
  repositoryName,
}: {
  error: string;
  githubId: string;
  repositoryName: string;
}): RegisterGitHubWebhookActionState {
  return {
    error,
    githubId,
    message: null,
    repositoryName,
    status: "error",
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
