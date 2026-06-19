"use client";

import { useState } from "react";

import { deleteStudy } from "../actions";

export default function StudyDeleteCard({
  studyId,
  studyName,
}: {
  studyId: string;
  studyName: string;
}) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === studyName;

  return (
    <form
      action={deleteStudy}
      className="rounded-xl border border-error-container bg-error-container/20 p-6 shadow-sm"
    >
      <input name="studyId" type="hidden" value={studyId} />
      <div className="mb-6">
        <p className="text-label-caps text-error">주의가 필요한 작업</p>
        <h2 className="section-title text-error">스터디 삭제</h2>
        <p className="mt-2 max-w-2xl text-body-sm text-on-surface-variant">
          스터디를 삭제하면 문제 풀이 내역과 멤버 정보가 삭제됩니다. 이 작업은
          되돌릴 수 없습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
        <label className="block rounded-lg border border-error-container bg-white p-4">
          <span className="mb-2 block text-label-caps text-slate-500">
            확인을 위해 &apos;{studyName}&apos; 입력
          </span>
          <input
            className="w-full border-none bg-transparent p-0 font-mono text-body-sm text-error outline-none placeholder:text-slate-300 focus:ring-0"
            name="confirmText"
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="확인 문구를 입력하세요"
            type="text"
            value={confirmText}
          />
        </label>
        <button
          className="rounded-lg bg-error px-4 py-3 text-body-sm font-bold text-on-error transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canDelete}
          type="submit"
        >
          스터디 삭제
        </button>
      </div>
    </form>
  );
}
