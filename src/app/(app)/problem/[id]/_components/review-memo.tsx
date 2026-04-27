"use client";

import { useState } from "react";

type ReviewMemoProps = {
  initialMemo: string;
  initialState: "PENDING" | "COMPLETE";
};

export default function ReviewMemo({
  initialMemo,
  initialState,
}: ReviewMemoProps) {
  const [memo, setMemo] = useState(initialMemo);
  const [savedMemo, setSavedMemo] = useState(initialMemo);
  const [state, setState] = useState(initialState);
  const [isEditing, setIsEditing] = useState(initialState === "PENDING");

  function handleComplete() {
    setSavedMemo(memo.trim());
    setState("COMPLETE");
    setIsEditing(false);
  }

  return (
    <section className="app-card p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-label-caps text-slate-400">Review Memo</p>
          <h2 className="section-title">풀이 아이디어 정리</h2>
        </div>
        <span
          className={
            state === "COMPLETE"
              ? "inline-flex w-fit rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed"
              : "inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-body-sm font-semibold text-slate-500"
          }
        >
          {state}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            className="min-h-56 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-4 text-body-md text-on-surface outline-none transition-all placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-secondary-container/40"
            onChange={(event) => setMemo(event.target.value)}
            placeholder="왜 뒤에서부터 최댓값을 유지하면 되는지, 실수한 부분, 다시 볼 포인트를 적어두세요."
            value={memo}
          />
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-body-sm text-slate-400">
              저장 시 mock 상태로 COMPLETE 처리됩니다.
            </p>
            <div className="flex gap-2">
              {state === "COMPLETE" ? (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setMemo(savedMemo);
                    setIsEditing(false);
                  }}
                  type="button"
                >
                  취소
                </button>
              ) : null}
              <button className="btn-primary" onClick={handleComplete} type="button">
                복습 완료
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {savedMemo ? (
            <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-body-md text-on-surface-variant">
              {savedMemo}
            </p>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
              아직 작성된 복습 메모가 없습니다.
            </div>
          )}
          <button
            className="btn-secondary"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            수정
          </button>
        </div>
      )}
    </section>
  );
}
