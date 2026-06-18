import "server-only";

import { cache } from "react";

import {
  getNextTierScore,
  getProgressLabel,
  getStudyTier,
  getUserDisplayName,
  normalizeCategories,
} from "@/services/studies/study.helper";
import {
  aggregateStudyMemberActivity,
  countStudyProblemShares,
  findPendingInvites,
  findProblemShareTargetStudies,
  findRecentStudyProblems,
  findStudyForLayout,
  findStudyMemberDetails,
  findStudyForOwner,
  findStudyForProblems,
  findStudyMembers,
  findStudySummary,
  findUserStudies,
  sumStudyProblemShareScoresByUser,
} from "@/services/studies/study.persistence.server";
import type {
  OwnerMember,
  ProblemShareTargetStudy,
  StudyInviteItem,
  StudyLayoutData,
  StudyListItem,
  StudyMember,
  StudyMemberFilters,
  StudyContributionItem,
  StudyOverviewMember,
  StudyOverviewStats,
  StudyOverviewSummary,
  StudyOwnerData,
  StudyProblemsData,
  StudyRecentProblem,
} from "@/types/study";
import { formatRelativeDate, formatShortDate } from "@/utils/date";
import { getTierProgress } from "@/utils/study";

// 문제를 공유할 수 있는 사용자의 스터디 목록을 조회한다.
export async function getProblemShareTargetStudies({
  problemId,
  userId,
}: {
  problemId: string;
  userId: string | undefined;
}): Promise<ProblemShareTargetStudy[]> {
  if (!userId) {
    return [];
  }

  const studies = await findProblemShareTargetStudies({ problemId, userId });

  return studies.map((study) => ({
    hasShared: study.problemShares.length > 0,
    id: study.id,
    memberCount: study._count.members,
    ownerName: study.owner.name ?? "Unknown",
    score: study.score,
    title: study.title,
  }));
}

// 사용자에게 도착한 유효한 대기 중 스터디 초대를 조회한다.
export async function getPendingInvites(
  userId: string | undefined,
): Promise<StudyInviteItem[]> {
  if (!userId) return [];
  const invites = await findPendingInvites(userId);

  return invites.map((invite) => ({
    id: invite.id,
    invitedByName: getUserDisplayName(invite.invitedBy.name),
    studyTitle: invite.study.title,
    timeLabel: formatRelativeDate(invite.createdAt),
  }));
}

// 스터디 상세 레이아웃에 필요한 접근 권한과 기본 정보를 조회한다.
export async function getStudyLayoutData({
  studyId,
  userId,
}: {
  studyId: string | undefined;
  userId: string | undefined;
}): Promise<StudyLayoutData | null> {
  if (!studyId || !userId) return null;

  const study = await findStudyForLayout({ studyId, userId });

  if (!study) {
    return null;
  }

  return {
    id: study.id,
    isOwner: study.ownerId === userId,
    name: study.title,
  };
}

// 사용자가 참여하거나 소유한 스터디 목록을 조회한다.
export async function getUserStudies(
  userId: string | undefined,
): Promise<StudyListItem[]> {
  if (!userId) return [];

  const studies = await findUserStudies(userId);

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

// 스터디 멤버 화면의 멤버와 활동·기여도 정보를 조회한다.
export async function getStudyMembers({
  filters,
  studyId,
  userId,
}: {
  filters: StudyMemberFilters;
  studyId: string;
  userId: string;
}): Promise<StudyMember[] | null> {
  const [study, activityByMember] = await Promise.all([
    findStudyMemberDetails({ filters, studyId, userId }),
    aggregateStudyMemberActivity({ studyId, userId }),
  ]);

  if (!study) {
    return null;
  }

  const activityByUserId = new Map(
    activityByMember.map((activity) => [activity.userId, activity]),
  );

  const members = study.members.map((member) => {
    const activity = activityByUserId.get(member.userId);
    const lastActiveAt = activity?._max.sharedAt ?? member.joinedAt;

    return {
      contribution: activity?._sum.score ?? 0,
      id: member.id,
      joinedAt: formatShortDate(member.joinedAt),
      joinedAtTime: member.joinedAt.getTime(),
      lastActive: formatShortDate(lastActiveAt),
      lastActiveTime: lastActiveAt.getTime(),
      name: getUserDisplayName(member.user.name),
      role: member.role,
    };
  });

  if (filters.sort === "lastActive") {
    return members.toSorted(
      (firstMember, secondMember) =>
        secondMember.lastActiveTime - firstMember.lastActiveTime,
    );
  }

  if (filters.sort === "contribution") {
    return members.toSorted(
      (firstMember, secondMember) =>
        secondMember.contribution - firstMember.contribution,
    );
  }

  return members;
}

const getStudyMembersSource = cache(
  async (studyId: string, userId: string) =>
    findStudyMembers({ studyId, userId }),
);

// 스터디 개요 화면의 기본 정보와 티어 정보를 조회한다.
export async function getStudySummary({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyOverviewSummary | null> {
  const study = await findStudySummary({ studyId, userId });

  if (!study) {
    return null;
  }

  const tier = getStudyTier(study.score);

  return {
    description: study.description ?? "아직 스터디 설명이 없습니다.",
    id: study.id,
    name: study.title,
    nextTierScore: getNextTierScore(tier),
    score: study.score,
    tier,
  };
}

// 스터디 개요 화면의 풀이 통계를 조회한다.
export async function getStudyStats({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyOverviewStats | null> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [members, problemShareCounts] = await Promise.all([
    getStudyMembersSource(studyId, userId),
    countStudyProblemShares({ oneWeekAgo, studyId, userId }),
  ]);

  if (!members) {
    return null;
  }

  return {
    memberCount: members.members.length,
    ...problemShareCounts,
  };
}

// 스터디 개요 화면의 멤버별 기여도를 조회한다.
export async function getStudyContribution({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyContributionItem[] | null> {
  const [study, contributionScores] = await Promise.all([
    getStudyMembersSource(studyId, userId),
    sumStudyProblemShareScoresByUser({ studyId, userId }),
  ]);

  if (!study) {
    return null;
  }

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

// 스터디 개요 화면의 멤버 목록을 조회한다.
export async function getStudyMemberPreviews({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyOverviewMember[] | null> {
  const study = await getStudyMembersSource(studyId, userId);

  if (!study) {
    return null;
  }

  return study.members.map((member) => ({
    name: getUserDisplayName(member.user.name),
    role: member.userId === study.ownerId ? "owner" : "member",
  }));
}

// 스터디 개요 화면의 최근 공유 문제를 조회한다.
export async function getRecentStudyProblems({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyRecentProblem[]> {
  const problems = await findRecentStudyProblems({
    limit: 10,
    studyId,
    userId,
  });

  return problems.map((share) => ({
    platform: share.problemSubmission.platform,
    solvedBy: getUserDisplayName(share.user.name),
    tier: share.problemSubmission.tier ?? "-",
    title: share.problemSubmission.title,
  }));
}

// 스터디 소유자 관리 화면에 필요한 멤버와 초대 정보를 조회한다.
export async function getStudyOwnerData({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyOwnerData | null> {
  const study = await findStudyForOwner({ studyId, userId });

  if (!study) {
    return null;
  }

  const members = study.members.map((member): OwnerMember => {
    const shares = study.problemShares.filter(
      (share) => share.userId === member.userId,
    );
    const lastSharedAt = shares.reduce<Date | null>(
      (latestSharedAt, share) =>
        !latestSharedAt || share.sharedAt > latestSharedAt
          ? share.sharedAt
          : latestSharedAt,
      null,
    );

    return {
      contribution: shares.reduce((total, share) => total + share.score, 0),
      id: member.id,
      isCurrentUser: member.userId === userId,
      joinedAt: formatShortDate(member.joinedAt),
      lastActive: formatShortDate(lastSharedAt ?? member.joinedAt),
      name: getUserDisplayName(member.user.name),
      role: member.userId === study.ownerId ? "OWNER" : member.role,
    };
  });

  if (!members.some((member) => member.role === "OWNER")) {
    members.unshift({
      contribution: study.problemShares
        .filter((share) => share.userId === study.ownerId)
        .reduce((total, share) => total + share.score, 0),
      id: study.ownerId,
      isCurrentUser: study.ownerId === userId,
      joinedAt: formatShortDate(study.createdAt),
      lastActive: formatShortDate(study.createdAt),
      name: getUserDisplayName(study.owner.name),
      role: "OWNER",
    });
  }

  return {
    members,
    pendingInvites: study.invites.map((invite) => ({
      id: invite.id,
      status: "Pending",
      target: invite.target,
    })),
    study: {
      description: study.description ?? "아직 스터디 설명이 없습니다.",
      id: study.id,
      name: study.title,
    },
  };
}

// 스터디에 공유된 문제 목록과 필터 정보를 조회한다.
export async function getStudyProblemsData({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyProblemsData | null> {
  const study = await findStudyForProblems({ studyId, userId });

  if (!study) {
    return null;
  }

  const problems = study.problemShares.map((share) => ({
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
    sharedAtTime: share.sharedAt.getTime(),
    sharedBy: getUserDisplayName(share.user.name),
    solutionCode: share.problemSubmission.code,
    status: share.problemSubmission.status,
    submittedAtText: share.problemSubmission.submittedAtText,
    tier: share.problemSubmission.tier,
    title: share.problemSubmission.title,
  }));

  return {
    memberNames: [
      getUserDisplayName(study.owner.name),
      ...study.members.map((member) => getUserDisplayName(member.user.name)),
    ].filter((name, index, names) => names.indexOf(name) === index),
    problems,
    tiers: problems
      .flatMap((problem) => problem.tier ?? [])
      .filter((tier, index, tiers) => tiers.indexOf(tier) === index),
  };
}
