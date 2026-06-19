"use client";

import { useActionState } from "react";

import type { OwnerInvite } from "@/types/study";

import {
  cancelStudyInvite,
  createStudyInvite,
  type CreateStudyInviteActionState,
} from "../actions";

const initialActionState: CreateStudyInviteActionState = {
  error: null,
  status: "idle",
  target: "",
};

export default function InviteMembersCard({
  initialInvites,
  studyId,
}: {
  initialInvites: OwnerInvite[];
  studyId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createStudyInvite,
    initialActionState,
  );

  return (
    <section className="app-card p-6">
      <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">멤버 초대</h2>
          <p className="text-body-sm text-slate-500">
            사용자 이름 또는 이메일로 스터디에 초대합니다.
          </p>
        </div>
        <span className="text-body-sm italic text-slate-400">
          Invitations are valid for 7 days
        </span>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        <div>
          <form action={formAction}>
            <input name="studyId" type="hidden" value={studyId} />
            <label className="block">
              <span className="mb-2 block text-label-caps text-slate-500">
                Username / Email
              </span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  aria-invalid={state.status === "error" ? true : undefined}
                  className="input-field"
                  defaultValue={state.status === "error" ? state.target : ""}
                  maxLength={120}
                  name="target"
                  placeholder="GitHub ID 또는 이메일"
                  required
                  type="text"
                />
                <button
                  className="btn-primary shrink-0"
                  disabled={isPending}
                  type="submit"
                >
                  초대
                </button>
              </div>
            </label>
          </form>

          {state.status === "error" ? (
            <p className="mt-3 rounded-lg bg-error/10 px-4 py-3 text-body-sm font-medium text-error">
              {state.error}
            </p>
          ) : null}

          {state.status === "success" ? (
            <p className="mt-3 rounded-lg bg-secondary-container/60 px-4 py-3 text-body-sm font-medium text-primary">
              초대를 보냈습니다.
            </p>
          ) : null}
        </div>

        <div>
          <h3 className="mb-4 text-label-caps text-slate-400">
            대기 중인 초대 ({initialInvites.length})
          </h3>
          <div className="divide-y divide-slate-50 rounded-lg border border-slate-100">
            {initialInvites.map((invite) => (
              <div
                className="flex items-center justify-between gap-4 px-4 py-3"
                key={invite.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-semibold text-on-surface">
                    {invite.target}
                  </p>
                  <p className="text-xs text-slate-400">{invite.status}</p>
                </div>
                <form action={cancelStudyInvite}>
                  <input name="studyId" type="hidden" value={studyId} />
                  <input name="inviteId" type="hidden" value={invite.id} />
                  <button
                    className="text-body-sm font-semibold text-error hover:underline"
                    type="submit"
                  >
                    취소
                  </button>
                </form>
              </div>
            ))}
            {initialInvites.length === 0 ? (
              <div className="px-4 py-6 text-center text-body-sm text-slate-400">
                대기 중인 초대가 없습니다.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
