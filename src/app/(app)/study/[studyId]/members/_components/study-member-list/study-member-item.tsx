"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProfileModal } from "@/components/ui/profile-modal";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { StudyMember } from "@/types/study";
import { studyMemberRoleLabels } from "@/utils/study-role";

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
            <UserAvatar image={member.avatar} name={member.name} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-primary">
                {member.name}
              </h2>
              <span
                className={
                  isOwner
                    ? "mt-1 inline-flex rounded-full bg-primary px-2.5 py-1 text-2.5 font-bold tracking-wide text-on-primary"
                    : isLeader
                      ? "mt-1 inline-flex rounded-full bg-secondary-fixed px-2.5 py-1 text-2.5 font-bold tracking-wide text-on-secondary-fixed"
                      : "mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-2.5 font-bold tracking-wide text-slate-500"
                }
              >
                {studyMemberRoleLabels[member.role]}
              </span>
            </div>
          </div>
          <Button
            className={isPrivileged ? "ring-1 ring-secondary/20" : undefined}
            onClick={() => setIsProfileOpen(true)}
            variant="secondary"
          >
            프로필
          </Button>
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
          </div>
        </div>
      </article>

      {isProfileOpen ? (
        <ProfileModal
          onClose={() => setIsProfileOpen(false)}
          userId={member.userId}
        />
      ) : null}
    </>
  );
}
