import { StudyListItem, StudyTier } from "@/types/study";
import {
  studyTierProgressColors,
  studyTierThumbnailColors,
} from "@/utils/color";
import { studyMemberRoleLabels } from "@/utils/study-role";
import Link from "next/link";

export default function StudyItem({ study }: { study: StudyListItem }) {
  return (
    <article className="app-card relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/5">
      {study.isOwner ? (
        <div className="absolute right-0 top-0 p-4">
          <span className="rounded-full bg-secondary-container px-1.5 py-0.5 text-xs font-medium leading-none text-on-secondary-container">
            {studyMemberRoleLabels.OWNER}
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
            {study.progressLabel}
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
