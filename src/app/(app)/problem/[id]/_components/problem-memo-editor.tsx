"use client";

import { useActionState, useState } from "react";

import {
  type ProblemMemoActionState,
  updateProblemMemo,
} from "@/app/(app)/problem/[id]/actions";
import { Button } from "@/components/ui/button";

type ProblemMemoEditorProps = {
  initialMemo: string | null;
  problemId: string;
};

const initialState: ProblemMemoActionState = {
  error: null,
  memo: "",
  status: "idle",
};

export default function ProblemMemoEditor({
  initialMemo,
  problemId,
}: ProblemMemoEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(handleUpdateMemo, {
    ...initialState,
    memo: initialMemo ?? "",
  });
  const memo = state.memo;

  async function handleUpdateMemo(
    prevState: ProblemMemoActionState,
    formData: FormData,
  ) {
    const nextState = await updateProblemMemo(prevState, formData);

    if (nextState.status === "success") {
      setIsEditing(false);
    }

    return nextState;
  }

  return (
    <section className="app-card p-6 md:p-8">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-secondary-fixed-dim" />
          <h2 className="section-title">메모</h2>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="secondary"
          >
            수정
          </Button>
        ) : null}
      </div>

      {isEditing ? (
        <form action={formAction} className="space-y-4">
          <input name="problemId" type="hidden" value={problemId} />
          <textarea
            className="input-field min-h-40 resize-y py-3"
            defaultValue={memo}
            maxLength={2000}
            name="memo"
            placeholder="풀이 접근, 실수한 부분, 다시 볼 포인트를 적어두세요."
          />
          {state.error ? (
            <p className="text-body-sm font-semibold text-error">
              {state.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button disabled={isPending} type="submit" variant="primary">
              저장
            </Button>
            <Button
              disabled={isPending}
              onClick={() => setIsEditing(false)}
              variant="secondary"
            >
              취소
            </Button>
          </div>
        </form>
      ) : memo ? (
        <p className="whitespace-pre-wrap wrap-break-word text-body-md text-on-surface-variant">
          {memo}
        </p>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
          저장된 메모가 없습니다.
        </div>
      )}
    </section>
  );
}
