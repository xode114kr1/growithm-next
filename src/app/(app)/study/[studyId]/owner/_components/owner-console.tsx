"use client";

import { useState } from "react";

type Invite = {
  id: string;
  status: "Pending";
  target: string;
};

type Member = {
  contribution: number;
  isCurrentUser: boolean;
  joinedAt: string;
  lastActive: string;
  name: string;
  role: "OWNER" | "LEADER" | "MEMBER";
};

type Study = {
  description: string;
  inviteLink: string;
  name: string;
};

export default function OwnerConsole({
  initialInvites,
  members,
  study,
}: {
  initialInvites: Invite[];
  members: Member[];
  study: Study;
}) {
  return (
    <div className="space-y-10">
      <InviteMembersCard initialInvites={initialInvites} inviteLink={study.inviteLink} />
      <ManageMembersCard members={members} />
      <StudySettingsCard study={study} />
      <DangerZoneCard studyName={study.name} />
    </div>
  );
}

function InviteMembersCard({
  initialInvites,
  inviteLink,
}: {
  initialInvites: Invite[];
  inviteLink: string;
}) {
  const [copied, setCopied] = useState(false);
  const [inviteTarget, setInviteTarget] = useState("");
  const [invites, setInvites] = useState(initialInvites);

  function handleInvite() {
    const trimmedTarget = inviteTarget.trim();

    if (!trimmedTarget) {
      return;
    }

    setInvites((currentInvites) => [
      ...currentInvites,
      {
        id: `invite-${Date.now()}`,
        status: "Pending",
        target: trimmedTarget,
      },
    ]);
    setInviteTarget("");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

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
        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-label-caps text-slate-500">
              Username / Email
            </span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input-field"
                onChange={(event) => setInviteTarget(event.target.value)}
                placeholder="github_id or email"
                type="text"
                value={inviteTarget}
              />
              <button className="btn-primary shrink-0" onClick={handleInvite} type="button">
                초대
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-label-caps text-slate-500">
              공유 초대 링크
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 p-1 pl-4">
              <code className="min-w-0 flex-1 truncate font-mono text-sm text-slate-600">
                {inviteLink}
              </code>
              <button className="btn-secondary min-h-10 px-3" onClick={handleCopy} type="button">
                {copied ? "복사됨" : "복사"}
              </button>
            </div>
          </label>
        </div>

        <div>
          <h3 className="mb-4 text-label-caps text-slate-400">
            대기 중인 초대 ({invites.length})
          </h3>
          <div className="divide-y divide-slate-50 rounded-lg border border-slate-100">
            {invites.map((invite) => (
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
                <button
                  className="text-body-sm font-semibold text-error hover:underline"
                  onClick={() =>
                    setInvites((currentInvites) =>
                      currentInvites.filter((item) => item.id !== invite.id),
                    )
                  }
                  type="button"
                >
                  취소
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ManageMembersCard({ members }: { members: Member[] }) {
  return (
    <section className="app-card p-6">
      <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">멤버 관리</h2>
          <p className="text-body-sm text-slate-500">
            역할을 변경하거나 스터디에서 내보낼 수 있습니다.
          </p>
        </div>
        <span className="text-body-sm text-slate-500">전체 멤버: {members.length}명</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <TableHead>사용자</TableHead>
              <TableHead>기여도</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>관리</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((member) => (
              <tr className="transition-colors hover:bg-slate-50/80" key={member.name}>
                <td className="min-w-[220px] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        member.role === "OWNER"
                          ? "flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary"
                          : "flex size-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600"
                      }
                    >
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{member.name}</p>
                      <p className="text-xs text-slate-400">last active {member.lastActive}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-body-sm font-semibold text-secondary">
                  {member.contribution.toLocaleString()} XP
                </td>
                <td className="px-6 py-4">
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-body-sm outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    defaultValue={member.role}
                    disabled={member.role === "OWNER"}
                  >
                    <option>OWNER</option>
                    <option>LEADER</option>
                    <option>MEMBER</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-body-sm text-slate-500">{member.joinedAt}</td>
                <td className="px-6 py-4">
                  {member.role === "OWNER" ? (
                    <span className="text-xs italic text-slate-300">No Action</span>
                  ) : (
                    <button
                      className="rounded-lg bg-error-container px-4 py-2 text-body-sm font-semibold text-error transition-opacity hover:opacity-80"
                      type="button"
                    >
                      내보내기
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StudySettingsCard({ study }: { study: Study }) {
  return (
    <section className="app-card p-6">
      <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">스터디 설정</h2>
          <p className="text-body-sm text-slate-500">
            스터디 이름과 설명을 관리합니다.
          </p>
        </div>
        <button className="btn-secondary w-fit" type="button">
          저장하기
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-label-caps text-slate-500">Study Name</span>
          <input className="input-field font-semibold" defaultValue={study.name} type="text" />
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-2 block text-label-caps text-slate-500">Description</span>
          <textarea
            className="min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-body-md outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-secondary-container/30"
            defaultValue={study.description}
          />
        </label>
      </div>
    </section>
  );
}

function DangerZoneCard({ studyName }: { studyName: string }) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === studyName;

  return (
    <section className="rounded-xl border border-error-container bg-error-container/20 p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-label-caps text-error">Danger Zone</p>
        <h2 className="section-title text-error">스터디 삭제</h2>
        <p className="mt-2 max-w-2xl text-body-sm text-on-surface-variant">
          스터디를 삭제하면 문제 풀이 내역과 멤버 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
        <label className="block rounded-lg border border-error-container bg-white p-4">
          <span className="mb-2 block text-label-caps text-slate-500">
            Confirm by typing &apos;{studyName}&apos;
          </span>
          <input
            className="w-full border-none bg-transparent p-0 font-mono text-body-sm text-error outline-none placeholder:text-slate-300 focus:ring-0"
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="Type here..."
            type="text"
            value={confirmText}
          />
        </label>
        <button
          className="rounded-lg bg-error px-4 py-3 text-body-sm font-bold text-on-error transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canDelete}
          type="button"
        >
          스터디 삭제
        </button>
      </div>
    </section>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>;
}
