"use client";

import { FormEvent, useState } from "react";

type SubmitStatus =
  | {
      message: string;
      type: "error" | "success";
    }
  | null;

export function WebhookRegistrationForm() {
  const [githubId, setGithubId] = useState("");
  const [repositoryName, setRepositoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const owner = githubId.trim();
    const repo = repositoryName.trim();

    if (!owner || !repo) {
      setStatus({
        message: "깃허브 ID와 Repository 이름을 모두 입력해주세요.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/github/webhook", {
        body: JSON.stringify({ owner, repo }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus({
          message:
            data?.message ??
            "웹훅 연결 요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
          type: "error",
        });
        return;
      }

      setStatus({
        message: data?.message ?? "웹훅 연결 요청이 완료되었습니다.",
        type: "success",
      });
    } catch {
      setStatus({
        message: "네트워크 오류로 웹훅 연결 요청에 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-5 rounded-xl border border-slate-100 bg-slate-50/60 p-5"
      onSubmit={handleSubmit}
    >
      <label className="block">
        <span className="mb-2 block text-label-caps text-slate-500">
          깃허브 ID
        </span>
        <input
          autoComplete="username"
          className="input-field"
          name="githubId"
          onChange={(event) => setGithubId(event.target.value)}
          placeholder="예: octocat"
          type="text"
          value={githubId}
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
          className="input-field"
          name="repositoryName"
          onChange={(event) => setRepositoryName(event.target.value)}
          placeholder="예: algorithm-solutions"
          type="text"
          value={repositoryName}
        />
        <span className="mt-2 block text-body-sm text-slate-500">
          백준 허브가 연동되어 있는 Repository 이름만 입력합니다.
        </span>
      </label>

      {status ? (
        <p
          className={
            status.type === "success"
              ? "text-body-sm font-semibold text-secondary"
              : "text-body-sm font-semibold text-error"
          }
          role="status"
        >
          {status.message}
        </p>
      ) : null}

      <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
        웹훅 연결하기
      </button>
    </form>
  );
}
