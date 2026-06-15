import Link from "next/link";

import { auth } from "@/lib/auth/auth";
import { getUserStudies } from "@/services/studies/study.query";
import type { StudyListItem, StudyTier } from "@/types/study";
import {
  studyTierProgressColors,
  studyTierThumbnailColors,
} from "@/utils/color";

import StudyCreateModal from "./study-create-modal";

export default async function StudyList() {
  const session = await auth();
  const userId = session?.user?.id;
  const studies = userId ? await getUserStudies(userId) : [];

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="section-title text-on-surface">참여 중인 스터디</h2>
        <StudyCreateModal />
      </div>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        {studies.map((study) => (
          <StudyCard key={study.id} study={study} />
        ))}
        {studies.length === 0 ? <EmptyStudyCard isSignedIn={Boolean(userId)} /> : null}
        <FindStudyCard />
      </div>
    </section>
  );
}

function StudyCard({ study }: { study: StudyListItem }) {
  return (
    <article className="app-card relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/5">
      {study.isOwner ? (
        <div className="absolute right-0 top-0 p-4">
          <span className="rounded-full bg-secondary-container px-1.5 py-0.5 text-xs font-medium leading-none text-on-secondary-container">
            owner
          </span>
        </div>
      ) : null}
      <Link
        className="mb-6 flex items-center gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
        href={`/study/${study.id}/overview`}
      >
        <TierThumbnail tier={study.tier} />
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-primary">
            {study.title}
          </h3>
          <p className="text-body-sm text-outline">
            {study.ownerName} · {study.tier} 티어
          </p>
        </div>
      </Link>
      <Link
        className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
        href={`/study/${study.id}/overview`}
      >
        <p className="mb-5 line-clamp-2 min-h-10 text-body-sm text-on-surface-variant">
          {study.description}
        </p>
        <div>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-semibold text-on-surface">스터디 점수</span>
            <span className="text-secondary">{study.progressLabel}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className={`h-full rounded-full bg-linear-to-r ${studyTierProgressColors[study.tier]}`}
              style={{ width: `${study.progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xs font-medium text-on-surface-variant">
            멤버 {study.memberCount.toLocaleString()}명
          </span>
          <span className="text-xs font-medium text-secondary">
            {study.score.toLocaleString()} XP
          </span>
        </div>
      </Link>
      <div className="mt-6 border-t border-slate-50 pt-6">
        <Link
          href={`/study/${study.id}/overview`}
          className="block w-full rounded-lg bg-primary py-2 text-center text-body-sm font-semibold text-on-primary transition-all hover:opacity-90"
        >
          입장하기
        </Link>
      </div>
    </article>
  );
}

function TierThumbnail({ tier }: { tier: StudyTier }) {
  return (
    <div
      aria-label={`${tier} 티어`}
      className={`flex size-12 shrink-0 items-center justify-center rounded-lg border text-base font-black shadow-sm ${studyTierThumbnailColors[tier]}`}
      title={`${tier} 티어`}
    >
      {tier.charAt(0)}
    </div>
  );
}

function EmptyStudyCard({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="app-card flex min-h-70.5 flex-col justify-center p-6">
      <p className="text-label-caps text-slate-400">참여 중인 스터디 없음</p>
      <h3 className="mt-2 text-base font-bold text-primary">
        {isSignedIn ? "참여 중인 스터디가 없습니다." : "로그인이 필요합니다."}
      </h3>
      <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
        {isSignedIn
          ? "새 스터디를 만들면 이곳에서 바로 확인할 수 있습니다."
          : "스터디를 만들거나 참여하려면 먼저 GitHub로 로그인해주세요."}
      </p>
    </div>
  );
}

function FindStudyCard() {
  return (
    <button
      className="flex min-h-70.5 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all hover:border-primary/20 hover:bg-white"
      type="button"
    >
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
        +
      </div>
      <h3 className="mb-1 font-bold text-primary">새 스터디 찾기</h3>
      <p className="max-w-45 text-xs leading-relaxed text-outline">
        내 수준과 목표에 맞는 스터디를 찾아보세요.
      </p>
    </button>
  );
}

