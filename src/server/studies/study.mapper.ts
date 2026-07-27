import "server-only";

import { formatRelativeDate, formatShortDate } from "@/utils/date";
import {
  getNextScoreTierScore,
  getScoreProgressLabel,
  getStudyTier,
  studyScoreTierThresholds,
} from "@/utils/score";
import { getTierProgress } from "@/utils/study";
import type {
  OwnedStudyInviteRow,
  OwnedStudyMembersInput,
  OwnedStudyRow,
  ProblemShareTargetStudyRow,
  StudyContributionRow,
  StudyContributionScoreRow,
  StudyInviteItemRow,
  StudyLayoutRow,
  StudyListItemRow,
  StudyMemberPreviewRow,
  StudyMembersInput,
  StudyProblemDetailRow,
  StudyProblemListItemRow,
  StudyProblemMemberRow,
  StudyProblemShareCounts,
  StudyProblemTierRow,
  StudyRecentProblemRow,
  StudyStatsRow,
  StudySummaryRow,
} from "@/server/studies/study.types";
import type {
  OwnerInvite,
  OwnerMember,
  OwnerStudy,
  ProblemShareTargetStudy,
  StudyContributionItem,
  StudyInviteItem,
  StudyLayoutData,
  StudyListItem,
  StudyMember,
  StudyOverviewMember,
  StudyOverviewStats,
  StudyOverviewSummary,
  StudyProblemDetail,
  StudyProblemListItem,
  StudyRecentProblem,
} from "@/types/study";

// 사용자 이름이 없을 때 사용할 표시 이름을 결정한다.
function getUserDisplayName(name: string | null) {
  return name || "Unknown";
}

// 문제 공유 대상 스터디 조회 결과를 화면용 데이터로 변환한다.
export function createStudyForProblemSharing(
  study: ProblemShareTargetStudyRow,
): ProblemShareTargetStudy {
  return {
    hasShared: study.problemShares.length > 0,
    id: study.id,
    memberCount: study._count.members,
    ownerName: study.owner.name ?? "Unknown",
    score: study.score,
    title: study.title,
  };
}

// 스터디 초대 조회 결과를 화면용 데이터로 변환한다.
export function createStudyInviteItem(
  invite: StudyInviteItemRow,
): StudyInviteItem {
  return {
    id: invite.id,
    invitedByAvatar: invite.invitedBy.image,
    invitedByName: getUserDisplayName(invite.invitedBy.name),
    studyTitle: invite.study.title,
    timeLabel: formatRelativeDate(invite.createdAt),
  };
}

// 스터디 조회 결과를 상세 레이아웃용 데이터로 변환한다.
export function createStudyLayoutData(
  study: StudyLayoutRow,
  userId: string,
): StudyLayoutData {
  return {
    id: study.id,
    isOwner: study.ownerId === userId,
    name: study.title,
  };
}

// 스터디 조회 결과를 목록용 데이터로 변환한다.
export function createStudyListItem(
  study: StudyListItemRow,
  userId: string,
): StudyListItem {
  const tier = getStudyTier(study.score);
  const progress = getTierProgress(study.score, tier);

  return {
    description: study.description ?? "아직 스터디 설명이 없습니다.",
    id: study.id,
    isOwner: study.ownerId === userId,
    memberCount: study._count.members,
    ownerName: study.owner.name ?? "Unknown",
    progress,
    progressLabel: getScoreProgressLabel(
      study.score,
      tier,
      studyScoreTierThresholds,
    ),
    score: study.score,
    tier,
    title: study.title,
  };
}

// 스터디 조회 결과를 개요 화면의 기본 정보로 변환한다.
export function createStudySummary(
  study: StudySummaryRow,
): StudyOverviewSummary {
  const tier = getStudyTier(study.score);

  return {
    description: study.description ?? "아직 스터디 설명이 없습니다.",
    id: study.id,
    name: study.title,
    nextTierScore: getNextScoreTierScore(tier, studyScoreTierThresholds),
    score: study.score,
    tier,
  };
}

// 스터디 멤버와 문제 공유 집계를 개요 화면의 통계로 변환한다.
export function createStudyStats(
  study: StudyStatsRow,
  problemShareCounts: StudyProblemShareCounts,
): StudyOverviewStats {
  return {
    memberCount: study.members.length,
    ...problemShareCounts,
  };
}

// 스터디 멤버와 공유 점수 집계를 기여도 목록으로 변환한다.
export function createStudyContributions(
  study: StudyContributionRow,
  contributionScores: StudyContributionScoreRow[],
): StudyContributionItem[] {
  const scoreByUserId = new Map(
    contributionScores.map((contribution) => [
      contribution.userId,
      contribution._sum.score ?? 0,
    ]),
  );

  return study.members.map((member) => ({
    name: getUserDisplayName(member.user.name),
    score: scoreByUserId.get(member.userId) ?? 0,
  }));
}

// 스터디 멤버 조회 결과를 개요 화면의 미리보기 목록으로 변환한다.
export function createStudyMemberPreviews(
  study: StudyMemberPreviewRow,
): StudyOverviewMember[] {
  return study.members.map((member) => ({
    avatar: member.user.image,
    name: getUserDisplayName(member.user.name),
    role: member.userId === study.ownerId ? "owner" : "member",
  }));
}

// 스터디 멤버와 활동 집계를 화면용 목록으로 변환하고 정렬한다.
export function createStudyMembers({
  activities,
  members,
  sort,
}: StudyMembersInput): StudyMember[] {
  const activityByUserId = new Map(
    activities.map((activity) => [activity.userId, activity]),
  );
  const studyMembers = members.map((member) => {
    const activity = activityByUserId.get(member.userId);
    const lastActiveAt = activity?._max.sharedAt ?? member.joinedAt;

    return {
      avatar: member.user.image,
      contribution: activity?._sum.score ?? 0,
      id: member.id,
      joinedAt: formatShortDate(member.joinedAt),
      joinedAtTime: member.joinedAt.getTime(),
      lastActive: formatShortDate(lastActiveAt),
      lastActiveTime: lastActiveAt.getTime(),
      name: getUserDisplayName(member.user.name),
      role: member.role,
      userId: member.userId,
    };
  });

  if (sort === "lastActive") {
    return studyMembers.toSorted(
      (firstMember, secondMember) =>
        secondMember.lastActiveTime - firstMember.lastActiveTime,
    );
  }

  if (sort === "contribution") {
    return studyMembers.toSorted(
      (firstMember, secondMember) =>
        secondMember.contribution - firstMember.contribution,
    );
  }

  return studyMembers;
}

// 최근 공유 문제 조회 결과를 개요 화면의 문제 항목으로 변환한다.
export function createStudyRecentProblem(
  share: StudyRecentProblemRow,
): StudyRecentProblem {
  return {
    platform: share.problemSubmission.platform,
    solvedBy: getUserDisplayName(share.user.name),
    tier: share.problemSubmission.tier ?? "-",
    title: share.problemSubmission.title,
  };
}

// 소유 스터디 조회 결과를 관리 화면의 설정 정보로 변환한다.
export function createOwnedStudy(study: OwnedStudyRow): OwnerStudy {
  return {
    description: study.description ?? "아직 스터디 설명이 없습니다.",
    id: study.id,
    name: study.title,
  };
}

// 소유 스터디의 멤버와 활동 집계를 관리 화면의 멤버 목록으로 변환한다.
export function createOwnedStudyMembers({
  activities,
  study,
  userId,
}: OwnedStudyMembersInput): OwnerMember[] {
  const activityByUserId = new Map(
    activities.map((activity) => [activity.userId, activity]),
  );

  const members = study.members.map((member): OwnerMember => {
    const activity = activityByUserId.get(member.userId);

    return {
      avatar: member.user.image,
      contribution: activity?._sum.score ?? 0,
      id: member.id,
      isCurrentUser: member.userId === userId,
      joinedAt: formatShortDate(member.joinedAt),
      lastActive: formatShortDate(activity?._max.sharedAt ?? member.joinedAt),
      name: getUserDisplayName(member.user.name),
      role: member.userId === study.ownerId ? "OWNER" : member.role,
    };
  });

  if (!members.some((member) => member.role === "OWNER")) {
    const ownerActivity = activityByUserId.get(study.ownerId);

    members.unshift({
      avatar: study.owner.image,
      contribution: ownerActivity?._sum.score ?? 0,
      id: study.ownerId,
      isCurrentUser: study.ownerId === userId,
      joinedAt: formatShortDate(study.createdAt),
      lastActive: formatShortDate(
        ownerActivity?._max.sharedAt ?? study.createdAt,
      ),
      name: getUserDisplayName(study.owner.name),
      role: "OWNER",
    });
  }

  return members;
}

// 대기 중인 스터디 초대를 소유자 관리 화면의 초대 항목으로 변환한다.
export function createOwnedStudyInvite(
  invite: OwnedStudyInviteRow,
): OwnerInvite {
  return {
    id: invite.id,
    status: "Pending",
    target: invite.target,
  };
}

// 공유 문제 조회 결과를 스터디 문제 목록 항목으로 변환한다.
export function createStudyProblemListItem(
  share: StudyProblemListItemRow,
): StudyProblemListItem {
  return {
    categories: normalizeCategories(share.problemSubmission.categories),
    code: `${share.problemSubmission.platform}-${share.problemSubmission.problemId}`,
    id: share.problemSubmission.id,
    platform: share.problemSubmission.platform,
    sharedAtLabel: formatShortDate(share.sharedAt),
    sharedBy: getUserDisplayName(share.user.name),
    status: share.problemSubmission.status,
    tier: share.problemSubmission.tier,
    title: share.problemSubmission.title,
  };
}

// 공유 문제 조회 결과를 스터디 문제 상세 정보로 변환한다.
export function createStudyProblemDetail(
  share: StudyProblemDetailRow,
): StudyProblemDetail {
  return {
    categories: normalizeCategories(share.problemSubmission.categories),
    code: `${share.problemSubmission.platform}-${share.problemSubmission.problemId}`,
    description: share.problemSubmission.description,
    id: share.problemSubmission.id,
    link: share.problemSubmission.link,
    memo: share.problemSubmission.memo,
    platform: share.problemSubmission.platform,
    score: share.problemSubmission.score,
    scoreMax: share.problemSubmission.scoreMax,
    sharedAtLabel: formatShortDate(share.sharedAt),
    sharedBy: getUserDisplayName(share.user.name),
    solutionCode: share.problemSubmission.code,
    status: share.problemSubmission.status,
    submittedAtText: share.problemSubmission.submittedAtText,
    tier: share.problemSubmission.tier,
    title: share.problemSubmission.title,
  };
}

// 문제를 공유한 스터디 멤버를 중복 없는 표시 이름 목록으로 변환한다.
export function createStudyProblemMemberNames(
  members: StudyProblemMemberRow[],
): string[] {
  return members
    .map((member) => getUserDisplayName(member.name))
    .filter((name, index, names) => names.indexOf(name) === index);
}

// 문제 티어 조회 결과에서 티어 문자열 목록을 만든다.
export function createStudyProblemTiers(
  problems: StudyProblemTierRow[],
): string[] {
  return problems.flatMap((problem) => problem.tier ?? []);
}

// 알 수 없는 카테고리 값을 문자열 배열로 정리한다.
function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}
