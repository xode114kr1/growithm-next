"use client";

import { FormEvent, useState } from "react";

type SubmitStatus =
  | {
      message: string;
      type: "error" | "success";
    }
  | null;

export function RepoRegistrationCard() {
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

        <button
          className="btn-primary w-full"
          disabled={isSubmitting}
          type="submit"
        >
          웹훅 연결하기
        </button>
      </form>
    </section>
  );
}
