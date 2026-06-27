"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { OwnerMember } from "@/types/study";
import { INITIAL_ACTION_STATE } from "@/utils/action-state";

import { removeStudyMember, updateStudyMemberRole } from "../actions";

export default function ManageMemberRow({
  member,
  studyId,
}: {
  member: OwnerMember;
  studyId: string;
}) {
  const [roleState, roleFormAction, isRolePending] = useActionState(
    updateStudyMemberRole,
    INITIAL_ACTION_STATE,
  );
  const [removeState, removeFormAction, isRemovePending] = useActionState(
    removeStudyMember,
    INITIAL_ACTION_STATE,
  );
  const isPending = isRolePending || isRemovePending;
  const errorMessage = roleState.error ?? removeState.error;

  return (
    <tr className="transition-colors hover:bg-slate-50/80">
      <td className="min-w-55 px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar image={member.avatar} name={member.name} size="sm" />
          <div>
            <p className="font-semibold text-on-surface">{member.name}</p>
            <p className="text-xs text-slate-400">
              최근 활동 {member.lastActive}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-body-sm font-semibold text-secondary">
        {member.contribution.toLocaleString()} XP
      </td>
      <td className="px-6 py-4">
        {member.role === "OWNER" ? (
          <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-body-sm font-semibold text-slate-400">
            OWNER
          </span>
        ) : (
          <form action={roleFormAction} className="flex gap-2">
            <input name="studyId" type="hidden" value={studyId} />
            <input name="memberId" type="hidden" value={member.id} />
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-body-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              defaultValue={member.role}
              disabled={isPending}
              name="role"
            >
              <option value="LEADER">리더</option>
              <option value="MEMBER">멤버</option>
            </select>
            <Button disabled={isPending} type="submit" variant="secondary">
              저장
            </Button>
          </form>
        )}
        {errorMessage ? (
          <p className="mt-2 max-w-64 text-xs font-medium text-error">
            {errorMessage}
          </p>
        ) : null}
      </td>
      <td className="px-6 py-4 text-body-sm text-slate-500">
        {member.joinedAt}
      </td>
      <td className="px-6 py-4">
        {member.role === "OWNER" ? (
          <span className="text-xs italic text-slate-300">작업 없음</span>
        ) : (
          <form action={removeFormAction}>
            <input name="studyId" type="hidden" value={studyId} />
            <input name="memberId" type="hidden" value={member.id} />
            <button
              className="rounded-lg bg-error-container px-4 py-2 text-body-sm font-semibold text-error transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isPending}
              type="submit"
            >
              내보내기
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}
