import type {
  StudyOverviewMember,
  StudyOverviewStats,
  StudyRecentProblem,
  StudyTier,
} from "@/types/study";
import { UserAvatar } from "@/components/ui/user-avatar";
import { studyTierBadgeColors, studyTierProgressColors } from "@/utils/color";
import { getTierProgress } from "@/utils/study";
import { studyOverviewMemberRoleLabels } from "@/utils/study-role";
import Link from "next/link";

export function StudyOverviewHeader({
  description,
  name,
}: {
  description: string;
  name: string;
}) {
  return (
    <header className="app-card p-6 md:p-8">
      <div className="max-w-3xl">
        <h1 className="page-title text-primary">{name}</h1>
        <p className="mt-3 text-body-md leading-relaxed text-on-surface-variant">
          {description}
        </p>
      </div>
    </header>
  );
}

export function StudyTierCard({
  nextTierScore,
  score,
  tier,
}: {
  nextTierScore: number;
  score: number;
  tier: StudyTier;
}) {
  const progress = getTierProgress(score, tier);
  const remainingScore = Math.max(nextTierScore - score, 0);

  return (
    <section className="app-card p-6 xl:col-span-2">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-label-caps text-slate-400">현재 스터디 티어</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-h2-editorial text-primary">{tier}</h2>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${studyTierBadgeColors[tier]}`}
            >
              {tier} 티어
            </span>
          </div>
        </div>
        <div className="md:text-right">
          <p className="text-body-sm text-slate-400">총 XP</p>
          <p className="text-h3-ui text-secondary">
            {score.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-linear-to-r ${studyTierProgressColors[tier]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-col justify-between gap-1 text-xs font-semibold text-slate-500 sm:flex-row">
          <span>
            {score.toLocaleString()} / {nextTierScore.toLocaleString()} XP
          </span>
          <span className="text-secondary">
            다음 티어까지 {remainingScore.toLocaleString()} XP
          </span>
        </div>
      </div>
    </section>
  );
}

export function StudyStatsCard({ stats }: { stats: StudyOverviewStats }) {
  const statItems = [
    { label: "전체 푼 문제", value: stats.totalSolved },
    { label: "이번 주 푼 문제", value: stats.weeklySolved },
    { label: "스터디원 수", value: stats.memberCount },
  ];

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="section-title">스터디 풀이 통계</h2>
        <p className="text-body-sm text-slate-500">최근 활동 기준</p>
      </div>
      <div className="space-y-5">
        {statItems.map((stat) => (
          <div className="flex items-center justify-between" key={stat.label}>
            <span className="text-body-sm font-medium text-slate-500">
              {stat.label}
            </span>
            <span className="text-h3-ui text-primary">
              {stat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StudyMembersCard({
  members,
}: {
  members: StudyOverviewMember[];
}) {
  return (
    <section className="app-card p-6">
      <div className="mb-6">
        <h2 className="section-title">스터디 멤버</h2>
        <p className="text-body-sm text-slate-500">
          {members.length}명 참여 중
        </p>
      </div>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            className={
              member.role === "owner"
                ? "flex items-center justify-between rounded-lg bg-surface-container-low p-3 ring-1 ring-secondary/10"
                : "flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-50"
            }
            key={`${member.role}-${member.name}`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar image={member.avatar} name={member.name} />
              <div className="min-w-0">
                <p className="truncate text-body-sm font-bold text-on-surface">
                  {member.name}
                </p>
                <p className="text-[10px] font-bold tracking-wide text-slate-400">
                  {studyOverviewMemberRoleLabels[member.role]}
                </p>
              </div>
            </div>
            {member.role === "owner" ? (
              <span className="rounded-full bg-secondary-fixed px-2 py-1 text-[10px] font-bold text-on-secondary-fixed">
                {studyOverviewMemberRoleLabels.owner}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function RecentSolvedProblems({
  problems,
  studyId,
}: {
  problems: StudyRecentProblem[];
  studyId: string;
}) {
  return (
    <section>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">최근에 푼 문제</h2>
          <p className="text-body-sm text-slate-500">
            스터디원들이 풀이한 문제들
          </p>
        </div>
        <Link
          className="text-body-sm font-semibold text-secondary transition-opacity hover:opacity-80"
          href={`/study/${studyId}/problems`}
        >
          전체 보기
        </Link>
      </div>
      <div className="app-card overflow-hidden">
        {problems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <TableHead>문제 제목</TableHead>
                  <TableHead>플랫폼</TableHead>
                  <TableHead>티어</TableHead>
                  <TableHead>풀이한 멤버</TableHead>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {problems.map((problem) => (
                  <tr
                    className="transition-colors hover:bg-slate-50/80"
                    key={`${problem.title}-${problem.solvedBy}`}
                  >
                    <td className="min-w-60 px-6 py-4 text-body-sm font-semibold text-on-surface">
                      {problem.title}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-slate-500">
                      {problem.platform}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold uppercase text-slate-600">
                        {problem.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-secondary">
                      {problem.solvedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-body-sm text-slate-500">
            아직 공유된 문제가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>
  );
}
