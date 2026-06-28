"use client";

import { useActionState } from "react";

import { ActionStateMessage } from "@/components/ui/action-state-message";
import { Button } from "@/components/ui/button";
import type { OwnerStudy } from "@/types/study";

import {
  type UpdateStudySettingsActionState,
  updateStudySettings,
} from "../actions";

const initialActionState: UpdateStudySettingsActionState = {
  description: "",
  error: null,
  status: "idle",
  title: "",
};

export default function StudySettingsCard({ study }: { study: OwnerStudy }) {
  const [state, formAction, isPending] = useActionState(
    updateStudySettings,
    initialActionState,
  );

  return (
    <form action={formAction} className="app-card p-6">
      <input name="studyId" type="hidden" value={study.id} />
      <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">스터디 설정</h2>
          <p className="text-body-sm text-slate-500">
            스터디 이름과 설명을 관리합니다.
          </p>
        </div>
        <Button
          className="w-fit"
          disabled={isPending}
          type="submit"
          variant="secondary"
        >
          저장하기
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-label-caps text-slate-500">
            스터디 이름
          </span>
          <input
            className="input-field font-semibold"
            defaultValue={state.status === "error" ? state.title : study.name}
            maxLength={80}
            name="title"
            required
            type="text"
          />
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-2 block text-label-caps text-slate-500">설명</span>
          <textarea
            className="min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-body-md outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-secondary-container/30"
            defaultValue={
              state.status === "error" ? state.description : study.description
            }
            maxLength={500}
            name="description"
          />
        </label>
      </div>

      {state.status === "error" ? (
        <ActionStateMessage className="mt-4" variant="error">
          {state.error}
        </ActionStateMessage>
      ) : null}

      {state.status === "success" ? (
        <ActionStateMessage className="mt-4" variant="success">
          스터디 설정을 저장했습니다.
        </ActionStateMessage>
      ) : null}
    </form>
  );
}
