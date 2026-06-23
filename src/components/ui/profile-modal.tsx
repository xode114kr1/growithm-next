"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getUserProfile } from "@/lib/users/user-api";
import type { UserProfile } from "@/types/user";

export function ProfileModal({
  onClose,
  userId,
}: {
  onClose: () => void;
  userId: string;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setProfile(await getUserProfile(userId));
    }

    loadProfile();
  }, [userId]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-90 flex items-center justify-center bg-slate-950/40 px-4 py-8"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl shadow-slate-950/20">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-primary">프로필</h2>
          <button
            aria-label="프로필 닫기"
            className="rounded-lg px-3 py-2 text-body-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>
        {profile ? (
          <>
            <div className="mb-6 flex items-center gap-4">
              <Image
                alt={`${profile.name} avatar`}
                className="size-14 rounded-full object-cover ring-4 ring-slate-50"
                height={56}
                src={profile.avatar}
                width={56}
              />
              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-primary">
                  {profile.name}
                </p>
                <p className="text-body-sm font-semibold text-slate-500">
                  {profile.tier}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProfileStat label="티어" value={profile.tier} />
              <ProfileStat
                label="푼 문제"
                value={`${profile.solvedCount.toLocaleString()}개`}
              />
              <ProfileStat
                label="점수"
                value={`${profile.score.toLocaleString()} XP`}
              />
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-body-sm text-slate-500">
            프로필을 불러오는 중...
          </p>
        )}
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
