"use client";

import { useMemo, useState } from "react";

export type StudyMember = {
  contribution: number;
  lastActive: string;
  name: string;
  role: "OWNER" | "LEADER" | "MEMBER";
};

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

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return members;
    }

    return members.filter((member) =>
      [member.name, member.role, member.lastActive]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [members, query]);

  return (
    <section className="space-y-5">
      <div className="app-card p-4">
        <label className="block">
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
      </div>

      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-2">
        {filteredMembers.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-body-sm text-slate-500">
          검색 결과가 없습니다.
        </div>
      ) : null}
    </section>
  );
}

function MemberCard({ member }: { member: StudyMember }) {
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
                  ? "mt-1 inline-flex rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-primary"
                  : isLeader
                  ? "mt-1 inline-flex rounded-full bg-secondary-fixed px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-secondary-fixed"
                  : "mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
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
        </div>
      </div>
    </article>
  );
}
