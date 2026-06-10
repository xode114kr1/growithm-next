"use client";

import { useMemo, useState } from "react";

import type { StudyMember } from "@/types/study";

type RoleFilter = "ALL" | StudyMember["role"];
type SortKey = "contribution" | "lastActive" | "joinedAt" | "name";

const roleLabels: Record<StudyMember["role"], string> = {
  LEADER: "Leader",
  MEMBER: "Member",
  OWNER: "Owner",
};

export default function StudyMemberList({
  members,
}: {
  members: StudyMember[];
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("contribution");
  const [selectedMember, setSelectedMember] = useState<StudyMember | null>(null);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return members
      .filter((member) => {
        if (roleFilter !== "ALL" && member.role !== roleFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return [member.name, roleLabels[member.role], member.role, member.lastActive]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .toSorted((firstMember, secondMember) => {
        if (sortKey === "name") {
          return firstMember.name.localeCompare(secondMember.name);
        }

        if (sortKey === "lastActive") {
          return secondMember.lastActiveTime - firstMember.lastActiveTime;
        }

        if (sortKey === "joinedAt") {
          return firstMember.joinedAtTime - secondMember.joinedAtTime;
        }

        return secondMember.contribution - firstMember.contribution;
      });
  }, [members, query, roleFilter, sortKey]);

  return (
    <section className="space-y-5">
      <div className="app-card grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_180px_180px]">
        <label className="block min-w-0">
          <span className="mb-2 block text-label-caps text-slate-500">
            Search Members
          </span>
          <input
            className="input-field"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름, 역할, 활동일로 검색"
            type="search"
            value={query}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-label-caps text-slate-500">
            Role
          </span>
          <select
            className="input-field"
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            value={roleFilter}
          >
            <option value="ALL">전체</option>
            <option value="OWNER">Owner</option>
            <option value="LEADER">Leader</option>
            <option value="MEMBER">Member</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-label-caps text-slate-500">
            Sort
          </span>
          <select
            className="input-field"
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            value={sortKey}
          >
            <option value="contribution">기여도순</option>
            <option value="lastActive">최근 활동순</option>
            <option value="joinedAt">가입일순</option>
            <option value="name">이름순</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-2">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onOpenProfile={setSelectedMember}
          />
        ))}
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-body-sm text-slate-500">
          검색 결과가 없습니다.
        </div>
      ) : null}

      {selectedMember ? (
        <MemberProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      ) : null}
    </section>
  );
}

function MemberCard({
  member,
  onOpenProfile,
}: {
  member: StudyMember;
  onOpenProfile: (member: StudyMember) => void;
}) {
  const isOwner = member.role === "OWNER";
  const isLeader = member.role === "LEADER";
  const isPrivileged = isOwner || isLeader;

  return (
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
              {roleLabels[member.role]}
            </span>
          </div>
        </div>
        <button
          className={
            isPrivileged
              ? "btn-secondary min-h-10 px-3 ring-1 ring-secondary/20"
              : "btn-secondary min-h-10 px-3"
          }
          onClick={() => onOpenProfile(member)}
          type="button"
        >
          프로필
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-label-caps text-slate-400">Contribution</p>
          <p className="mt-1 section-title text-secondary">
            {member.contribution.toLocaleString()} XP
          </p>
        </div>
        <div>
          <p className="text-label-caps text-slate-400">Last Active</p>
          <p className="mt-1 text-body-md font-semibold text-on-surface">
            {member.lastActive}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            joined {member.joinedAt}
          </p>
        </div>
      </div>
    </article>
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
                {roleLabels[member.role]}
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
          <ProfileStat label="Contribution" value={`${member.contribution.toLocaleString()} XP`} />
          <ProfileStat label="Role" value={roleLabels[member.role]} />
          <ProfileStat label="Last Active" value={member.lastActive} />
          <ProfileStat label="Joined" value={member.joinedAt} />
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
