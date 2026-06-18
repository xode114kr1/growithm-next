"use client";

import { useState } from "react";

import type { StudyMember } from "@/types/study";

import { studyMemberRoleLabels } from "../constants";

export default function StudyMemberItem({
  member,
}: {
  member: StudyMember;
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isOwner = member.role === "OWNER";
  const isLeader = member.role === "LEADER";
  const isPrivileged = isOwner || isLeader;

  return (
    <>
      <article className="app-card p-6 transition-all hover:shadow-lg hover:shadow-teal-900/5">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={
                isOwner
                  ? "flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-black text-on-primary"
                  : isLeader
                    ? "flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-base font-black text-on-secondary"
                    : "flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-base font-black text-slate-600"
              }
            >
              {member.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-primary">
                {member.name}
              </h2>
              <span
                className={
                  isOwner
                    ? "mt-1 inline-flex rounded-full bg-primary px-2.5 py-1 text-2.5 font-bold uppercase tracking-wide text-on-primary"
                    : isLeader
                      ? "mt-1 inline-flex rounded-full bg-secondary-fixed px-2.5 py-1 text-2.5 font-bold uppercase tracking-wide text-on-secondary-fixed"
                      : "mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-2.5 font-bold uppercase tracking-wide text-slate-500"
                }
              >
                {studyMemberRoleLabels[member.role]}
              </span>
            </div>
          </div>
          <button
            className={
              isPrivileged
                ? "btn-secondary min-h-10 px-3 ring-1 ring-secondary/20"
                : "btn-secondary min-h-10 px-3"
            }
            onClick={() => setIsProfileOpen(true)}
            type="button"
          >
            프로필
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div>
            <p className="text-label-caps text-slate-400">기여도</p>
            <p className="mt-1 section-title text-secondary">
              {member.contribution.toLocaleString()} XP
            </p>
          </div>
          <div>
            <p className="text-label-caps text-slate-400">최근 활동</p>
            <p className="mt-1 text-body-md font-semibold text-on-surface">
              {member.lastActive}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              joined {member.joinedAt}
            </p>
          </div>
        </div>
      </article>

      {isProfileOpen ? (
        <MemberProfileModal
          member={member}
          onClose={() => setIsProfileOpen(false)}
        />
      ) : null}
    </>
  );
}

function MemberProfileModal({
  member,
  onClose,
}: {
  member: StudyMember;
  onClose: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl shadow-slate-950/20">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-black text-on-primary">
              {member.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-primary">
                {member.name}
              </h2>
              <p className="text-body-sm font-semibold text-slate-500">
                {studyMemberRoleLabels[member.role]}
              </p>
            </div>
          </div>
          <button
            aria-label="멤버 프로필 닫기"
            className="rounded-lg px-3 py-2 text-body-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ProfileStat
            label="기여도"
            value={`${member.contribution.toLocaleString()} XP`}
          />
          <ProfileStat
            label="역할"
            value={studyMemberRoleLabels[member.role]}
          />
          <ProfileStat label="최근 활동" value={member.lastActive} />
          <ProfileStat label="참여일" value={member.joinedAt} />
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-label-caps text-slate-400">{label}</p>
      <p className="mt-2 text-body-md font-bold text-on-surface">{value}</p>
    </div>
  );
}
