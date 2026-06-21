import Image from "next/image";

import type { FriendProfile } from "@/types/friend";

const relationLabels: Record<FriendProfile["relationStatus"], string> = {
  friend: "친구",
  none: "연결되지 않음",
  received_request: "받은 친구 요청",
  sent_request: "보낸 친구 요청",
};

export function FriendProfileModal({
  onClose,
  profile,
}: {
  onClose: () => void;
  profile: FriendProfile;
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
            <Image
              alt={`${profile.name} avatar`}
              className="size-14 rounded-full object-cover ring-4 ring-slate-50"
              height={56}
              src={profile.avatar}
              width={56}
            />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-primary">
                {profile.name}
              </h2>
              <p className="text-body-sm font-semibold text-slate-500">
                {relationLabels[profile.relationStatus]}
              </p>
            </div>
          </div>
          <button
            aria-label="프로필 닫기"
            className="rounded-lg px-3 py-2 text-body-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ProfileStat label="이름" value={profile.name} />
          <ProfileStat
            label="친구 상태"
            value={relationLabels[profile.relationStatus]}
          />
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
