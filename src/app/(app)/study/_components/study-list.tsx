import Link from "next/link";

import StudyCreateModal from "@/app/(app)/study/_components/study-create-modal";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

type StudyTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Ruby";

type StudyListItem = {
  description: string;
  id: string;
  isOwner: boolean;
  memberCount: number;
  ownerName: string;
  progress: number;
  progressLabel: string;
  score: number;
  tier: StudyTier;
  title: string;
};

const tierThresholds = [
  { minScore: 3000, tier: "Ruby" },
  { minScore: 1500, tier: "Diamond" },
  { minScore: 700, tier: "Platinum" },
  { minScore: 300, tier: "Gold" },
  { minScore: 100, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: StudyTier }>;

const tierThumbnails: Record<StudyTier, { className: string; label: string }> = {
  Bronze: {
    className: "border-amber-700/20 bg-amber-700 text-white shadow-amber-900/10",
    label: "B",
  },
  Silver: {
    className: "border-slate-300 bg-slate-200 text-slate-700 shadow-slate-400/10",
    label: "S",
  },
  Gold: {
    className: "border-yellow-400/30 bg-yellow-400 text-yellow-950 shadow-yellow-500/10",
    label: "G",
  },
  Platinum: {
    className: "border-cyan-200 bg-primary-fixed text-primary shadow-cyan-500/10",
    label: "P",
  },
  Diamond: {
    className: "border-sky-300 bg-sky-100 text-sky-800 shadow-sky-500/10",
    label: "D",
  },
  Ruby: {
    className: "border-rose-300 bg-rose-600 text-white shadow-rose-700/10",
    label: "R",
  },
};

export default async function StudyList() {
  const session = await auth();
  const userId = session?.user?.id;
  const studies = userId ? await getUserStudies(userId) : [];

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="section-title text-on-surface">Participating Studies</h2>
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

async function getUserStudies(userId: string): Promise<StudyListItem[]> {
  const studies = await prisma.study.findMany({
    include: {
      _count: {
        select: {
          members: true,
        },
      },
      owner: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    where: {
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  });

  return studies.map((study) => {
    const tier = getStudyTier(study.score);
    const progress = getTierProgress(study.score, tier);

    return {
      description: study.description ?? "아직 스터디 설명이 없습니다.",
      id: study.id,
      isOwner: study.ownerId === userId,
      memberCount: study._count.members,
      ownerName: study.owner.name ?? "Unknown",
      progress,
      progressLabel: getProgressLabel(study.score, tier),
      score: study.score,
      tier,
      title: study.title,
    };
  });
}

function StudyCard({ study }: { study: StudyListItem }) {
  return (
    <article className="app-card relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/5">
      {study.isOwner ? (
        <div className="absolute right-0 top-0 p-4">
          <span className="rounded-full bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
            Owner
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
            {study.ownerName} · {study.tier} Tier
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
            <span className="font-semibold text-on-surface">Study Score</span>
            <span className="text-secondary">{study.progressLabel}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-secondary"
              style={{ width: `${study.progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xs font-medium text-on-surface-variant">
            {study.memberCount.toLocaleString()} Members
          </span>
          <span className="text-xs font-medium text-secondary">
            {study.score.toLocaleString()} XP
          </span>
        </div>
      </Link>
      <div className="mt-6 flex gap-2 border-t border-slate-50 pt-6">
        <Link
          href={`/study/${study.id}/overview`}
          className="flex-1 rounded-lg bg-primary py-2 text-center text-body-sm font-semibold text-on-primary transition-all hover:opacity-90"
        >
          Enter Room
        </Link>
        <Link
          className="rounded-lg bg-surface-container-low px-3 py-2 text-primary transition-all hover:bg-surface-container"
          href={`/study/${study.id}/members`}
        >
          Members
        </Link>
      </div>
    </article>
  );
}

function TierThumbnail({ tier }: { tier: StudyTier }) {
  const thumbnail = tierThumbnails[tier];

  return (
    <div
      aria-label={`${tier} tier`}
      className={`flex size-12 shrink-0 items-center justify-center rounded-lg border text-base font-black shadow-sm ${thumbnail.className}`}
      title={`${tier} tier`}
    >
      {thumbnail.label}
    </div>
  );
}

function EmptyStudyCard({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="app-card flex min-h-[282px] flex-col justify-center p-6">
      <p className="text-label-caps text-slate-400">No Studies</p>
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
      className="flex min-h-[282px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all hover:border-primary/20 hover:bg-white"
      type="button"
    >
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
        +
      </div>
      <h3 className="mb-1 font-bold text-primary">Find New Study</h3>
      <p className="max-w-[180px] text-xs leading-relaxed text-outline">
        Explore the directory to find study labs matching your level.
      </p>
    </button>
  );
}

function getStudyTier(score: number): StudyTier {
  return (
    tierThresholds.find((threshold) => score >= threshold.minScore)?.tier ??
    "Bronze"
  );
}

function getTierProgress(score: number, tier: StudyTier) {
  const currentTierIndex = tierThresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const currentThreshold = tierThresholds[currentTierIndex];
  const nextThreshold = tierThresholds[currentTierIndex - 1];

  if (!currentThreshold || !nextThreshold) {
    return 100;
  }

  const currentTierScore = score - currentThreshold.minScore;
  const nextTierScore = nextThreshold.minScore - currentThreshold.minScore;

  return Math.max(0, Math.min((currentTierScore / nextTierScore) * 100, 100));
}

function getProgressLabel(score: number, tier: StudyTier) {
  const currentTierIndex = tierThresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const nextThreshold = tierThresholds[currentTierIndex - 1];

  if (!nextThreshold) {
    return "Max tier";
  }

  return `${score.toLocaleString()} / ${nextThreshold.minScore.toLocaleString()} XP`;
}
