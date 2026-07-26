import "server-only";

import {
  createOwnedStudy,
  createOwnedStudyInvite,
  createOwnedStudyMembers,
  createStudyContributions,
  createStudyInviteItem,
  createStudyForProblemSharing,
  createStudyLayoutData,
  createStudyListItem,
  createStudyMemberPreviews,
  createStudyMembers,
  createStudyProblemDetail,
  createStudyProblemListItem,
  createStudyProblemMemberNames,
  createStudyProblemTiers,
  createStudyRecentProblem,
  createStudyStats,
  createStudySummary,
} from "@/server/studies/study.mapper";
import {
  aggregateOwnedStudyMemberActivity,
  aggregateStudyMemberActivity,
  countFilteredStudyProblems,
  countStudyProblemShares,
  findOwnedStudy,
  findOwnedStudyMembers,
  findOwnedStudyPendingInvites,
  findPendingInvites,
  findProblemShareTargetStudies,
  findRecentStudyProblems,
  findStudyForLayout,
  findStudyMemberDetails,
  findStudyMembers,
  findStudyProblemDetail,
  findStudyProblemSharingMembers,
  findStudyProblemTiers,
  findStudyProblems,
  findStudySummary,
  findUserStudies,
  sumStudyProblemShareScoresByUser,
} from "@/server/studies/study.repository";
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
  StudyMemberFilters,
  StudyOverviewMember,
  StudyOverviewStats,
  StudyOverviewSummary,
  StudyProblemDetail,
  StudyProblemFilters,
  StudyProblemListItem,
  StudyRecentProblem,
} from "@/types/study";

// 문제를 공유할 수 있는 사용자의 스터디 목록을 조회한다.
export async function getStudiesForProblemSharing({
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

  return studies.map(createStudyForProblemSharing);
}

// 사용자에게 도착한 유효한 대기 중 스터디 초대를 조회한다.
export async function getPendingInvites(
  userId: string | undefined,
): Promise<StudyInviteItem[]> {
  if (!userId) return [];
  const invites = await findPendingInvites(userId);

  return invites.map(createStudyInviteItem);
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

  return createStudyLayoutData(study, userId);
}

// 사용자가 참여하거나 소유한 스터디 목록을 조회한다.
export async function getUserStudies(
  userId: string | undefined,
): Promise<StudyListItem[]> {
  if (!userId) return [];

  const studies = await findUserStudies(userId);

  return studies.map((study) => createStudyListItem(study, userId));
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

  return createStudyMembers({
    activities: activityByMember,
    members: study.members,
    sort: filters.sort,
  });
}

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

  return createStudySummary(study);
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
    findStudyMembers({ studyId, userId }),
    countStudyProblemShares({ oneWeekAgo, studyId, userId }),
  ]);

  if (!members) {
    return null;
  }

  return createStudyStats(members, problemShareCounts);
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
    findStudyMembers({ studyId, userId }),
    sumStudyProblemShareScoresByUser({ studyId, userId }),
  ]);

  if (!study) {
    return null;
  }

  return createStudyContributions(study, contributionScores);
}

// 스터디 개요 화면의 멤버 목록을 조회한다.
export async function getStudyMemberPreviews({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyOverviewMember[] | null> {
  const study = await findStudyMembers({ studyId, userId });

  if (!study) {
    return null;
  }

  return createStudyMemberPreviews(study);
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

  return problems.map(createStudyRecentProblem);
}

// 스터디 소유자 관리 화면의 설정 정보를 조회한다.
export async function getOwnedStudy({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<OwnerStudy | null> {
  const study = await findOwnedStudy({ studyId, userId });

  if (!study) {
    return null;
  }

  return createOwnedStudy(study);
}

// 스터디 소유자 관리 화면의 멤버와 활동 정보를 조회한다.
export async function getOwnedStudyMembers({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<OwnerMember[] | null> {
  const [study, activityByMember] = await Promise.all([
    findOwnedStudyMembers({ studyId, userId }),
    aggregateOwnedStudyMemberActivity({ studyId, userId }),
  ]);

  if (!study) {
    return null;
  }

  return createOwnedStudyMembers({
    activities: activityByMember,
    study,
    userId,
  });
}

// 스터디 소유자 관리 화면의 대기 중인 초대를 조회한다.
export async function getOwnedStudyPendingInvites({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<OwnerInvite[]> {
  const invites = await findOwnedStudyPendingInvites({ studyId, userId });

  return invites.map(createOwnedStudyInvite);
}

export const STUDY_PROBLEM_PAGE_SIZE = 10;

type StudyProblemPage = {
  hasNextPage: boolean;
  items: StudyProblemListItem[];
  nextCursor: string | null;
};

// 스터디에 공유된 문제 목록을 조회한다.
export async function getStudyProblems({
  cursor = null,
  filters,
  studyId,
  userId,
}: {
  cursor?: string | null;
  filters: StudyProblemFilters;
  studyId: string;
  userId: string;
}): Promise<StudyProblemPage> {
  const shares = await findStudyProblems({
    cursor,
    filters,
    pageSize: STUDY_PROBLEM_PAGE_SIZE,
    studyId,
    userId,
  });
  const hasNextPage = shares.length > STUDY_PROBLEM_PAGE_SIZE;
  const pageShares = shares.slice(0, STUDY_PROBLEM_PAGE_SIZE);
  const lastShare = pageShares.at(-1);

  return {
    hasNextPage,
    items: pageShares.map(createStudyProblemListItem),
    nextCursor: hasNextPage && lastShare ? lastShare.id : null,
  };
}

// 스터디에 공유된 문제의 모달 상세 정보를 조회한다.
export async function getStudyProblemDetail({
  problemId,
  studyId,
  userId,
}: {
  problemId: string;
  studyId: string;
  userId: string;
}): Promise<StudyProblemDetail | null> {
  const share = await findStudyProblemDetail({ problemId, studyId, userId });

  if (!share) {
    return null;
  }

  return createStudyProblemDetail(share);
}

// 스터디에 공유된 전체 문제 수를 조회한다.
export async function getStudyProblemCount({
  filters,
  studyId,
  userId,
}: {
  filters?: StudyProblemFilters;
  studyId: string;
  userId: string;
}): Promise<number> {
  return countFilteredStudyProblems({ filters, studyId, userId });
}

// 스터디 문제 필터에 필요한 공유 멤버 이름을 조회한다.
export async function getStudyProblemMemberNames({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<string[] | null> {
  const members = await findStudyProblemSharingMembers({ studyId, userId });

  if (!members) {
    return null;
  }

  return createStudyProblemMemberNames(members);
}

// 스터디 문제 필터에 필요한 고유 티어를 조회한다.
export async function getStudyProblemTiers({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<string[]> {
  const tiers = await findStudyProblemTiers({ studyId, userId });

  return createStudyProblemTiers(tiers);
}
