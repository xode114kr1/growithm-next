"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import type { GitHubRepositoryWebhookSummary } from "@/types/github";

import {
  registerGitHubWebhookAction,
  type RegisterGitHubWebhookActionState,
} from "../actions";

const initialActionState: RegisterGitHubWebhookActionState = {
  error: null,
  githubId: "",
  message: null,
  repositoryName: "",
  status: "idle",
};

type RepoRegistrationCardProps = {
  currentWebhook: GitHubRepositoryWebhookSummary | null;
};

export function RepoRegistrationCard({
  currentWebhook,
}: RepoRegistrationCardProps) {
  const hasCurrentWebhook = currentWebhook !== null;
  const [isEditing, setIsEditing] = useState(!hasCurrentWebhook);
  const [state, formAction, isPending] = useActionState(
    registerGitHubWebhookAction,
    initialActionState,
  );
  const registeredRepository = getRegisteredRepository({
    currentWebhook,
    state,
  });
  const hasRegisteredWebhook = registeredRepository !== null;
  const isInputDisabled =
    hasRegisteredWebhook && !isEditing && state.status !== "error";

  function handleFormAction(formData: FormData) {
    formAction(formData);
    setIsEditing(false);
  }

  return (
    <section className="app-card grid grid-cols-1 gap-8 p-6 lg:grid-cols-[1fr_420px] lg:p-8">
      <div>
        <p className="mb-3 text-label-caps text-secondary">3단계</p>
        <h2 className="section-title mb-3">서비스에 GitHub 웹훅 연결하기</h2>
        <p className="text-body-md text-on-surface-variant">
          이 서비스가 사용자의 GitHub Repo에 웹훅을 연결할 수 있도록 깃허브
          ID와 Repository 이름을 입력합니다. 연결 후에는 백준 허브가 올린 커밋
          정보를 바탕으로 풀이 기록과 통계가 자동으로 갱신됩니다.
        </p>
        <ol className="mt-5 grid gap-2 text-body-sm text-on-surface-variant">
          <li>1. 본인의 GitHub ID와 저장소 이름을 입력합니다.</li>
          <li>2. 웹훅 연결하기 버튼을 클릭해 연결을 요청합니다.</li>
          <li>3. 연결 완료 후 풀이 기록과 통계가 자동으로 갱신됩니다.</li>
        </ol>
      </div>

      <form
        action={handleFormAction}
        className="relative grid gap-5 rounded-xl border border-slate-100 bg-slate-50/60 p-5 pt-14"
      >
        {hasRegisteredWebhook ? (
          <button
            aria-label="웹훅 정보 수정하기"
            className="absolute right-5 top-5 inline-flex size-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-primary transition-all hover:border-secondary hover:text-secondary hover:ring-3 hover:ring-secondary-container/30 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-500 disabled:ring-0"
            disabled={isPending || isEditing}
            onClick={() => setIsEditing(true)}
            title="수정하기"
            type="button"
          >
            <Pencil aria-hidden="true" size={16} />
          </button>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-label-caps text-slate-500">
            깃허브 ID
          </span>
          <input
            autoComplete="username"
            aria-invalid={state.status === "error" ? true : undefined}
            className="input-field"
            defaultValue={
              state.status === "error"
                ? state.githubId
                : registeredRepository?.owner
            }
            disabled={isInputDisabled}
            name="githubId"
            placeholder="예: octocat"
            type="text"
          />
          <span className="mt-2 block text-body-sm text-slate-500">
            깃허브 프로필 상단에 표시되는 닉네임(아이디)을 입력해주세요.
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-label-caps text-slate-500">
            Repository 이름
          </span>
          <input
            autoComplete="off"
            aria-invalid={state.status === "error" ? true : undefined}
            className="input-field"
            defaultValue={
              state.status === "error"
                ? state.repositoryName
                : registeredRepository?.repo
            }
            disabled={isInputDisabled}
            name="repositoryName"
            placeholder="예: algorithm-solutions"
            type="text"
          />
          <span className="mt-2 block text-body-sm text-slate-500">
            백준 허브가 연동되어 있는 Repository 이름만 입력합니다.
          </span>
        </label>

        {state.status === "error" ? (
          <p className="text-body-sm font-semibold text-error" role="status">
            {state.error}
          </p>
        ) : null}

        {state.status === "success" ? (
          <p className="text-body-sm font-semibold text-secondary" role="status">
            {state.message}
          </p>
        ) : null}

        <Button
          className="w-full"
          disabled={isPending || isInputDisabled}
          type="submit"
          variant="primary"
        >
          {hasRegisteredWebhook ? "웹훅 저장하기" : "웹훅 연결하기"}
        </Button>
      </form>
    </section>
  );
}

function getRegisteredRepository({
  currentWebhook,
  state,
}: {
  currentWebhook: GitHubRepositoryWebhookSummary | null;
  state: RegisterGitHubWebhookActionState;
}) {
  if (state.status === "success") {
    return {
      owner: state.githubId,
      repo: state.repositoryName,
    };
  }

  return currentWebhook
    ? parseRepositoryFullName(currentWebhook.repositoryFullName)
    : null;
}

function parseRepositoryFullName(repositoryFullName: string) {
  const [owner, ...repoParts] = repositoryFullName.split("/");

  return {
    owner,
    repo: repoParts.join("/"),
  };
}
