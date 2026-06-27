import "server-only";

import type { StudyMemberRole } from "@/generated/prisma/enums";
import {
  acceptStudyInviteRecord,
  cancelStudyInviteRecord,
  createStudyRecord,
  deleteOwnedStudy,
  findStudyInviteContext,
  removeStudyMemberRecord,
  rejectStudyInviteRecord,
  updateStudyMemberRoleRecord,
  updateStudySettingsRecord,
  upsertStudyInvite,
} from "@/server/studies/study.repository";

const INVITE_EXPIRATION_DAYS = 7;

// 스터디를 생성하고 생성된 스터디 ID를 반환한다.
export async function createStudy(input: {
  description: string;
  title: string;
  userId: string;
}) {
  return createStudyRecord(input);
}

// 사용자가 받은 유효한 스터디 초대를 수락한다.
export async function acceptStudyInvite({
  inviteId,
  userId,
}: {
  inviteId: string;
  userId: string;
}) {
  return acceptStudyInviteRecord({ inviteId, userId });
}

// 사용자가 받은 스터디 초대를 거절한다.
export async function rejectStudyInvite(input: {
  inviteId: string;
  userId: string;
}) {
  await rejectStudyInviteRecord(input);
}

// 소유한 스터디에 대상 사용자를 초대한다.
export async function createStudyInvite({
  studyId,
  target,
  userId,
}: {
  studyId: string;
  target: string;
  userId: string;
}) {
  const { existingMember, study, targetUser } = await findStudyInviteContext({
    studyId,
    target,
    userId,
  });

  if (!study) return { error: "초대를 보낼 수 있는 스터디를 찾을 수 없습니다." };
  if (!targetUser) return { error: "해당 사용자 이름 또는 이메일을 찾을 수 없습니다." };
  if (targetUser.id === userId) return { error: "본인은 초대할 수 없습니다." };
  if (existingMember) return { error: "이미 스터디에 참여 중인 사용자입니다." };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRATION_DAYS);
  await upsertStudyInvite({
    expiresAt,
    studyId: study.id,
    target: targetUser.name ?? target,
    targetUserId: targetUser.id,
    userId,
  });
  return { error: null };
}

// 소유자가 보낸 대기 초대를 취소한다.
export async function cancelStudyInvite(input: {
  inviteId: string;
  studyId: string;
  userId: string;
}) {
  return cancelStudyInviteRecord(input);
}

// 소유한 스터디의 일반 멤버 역할을 변경한다.
export async function updateStudyMemberRole(input: {
  memberId: string;
  role: StudyMemberRole;
  studyId: string;
  userId: string;
}) {
  return updateStudyMemberRoleRecord(input);
}

// 소유한 스터디에서 일반 멤버를 제거한다.
export async function removeStudyMember(input: {
  memberId: string;
  studyId: string;
  userId: string;
}) {
  return removeStudyMemberRecord(input);
}

// 소유한 스터디의 제목과 설명을 수정한다.
export async function updateStudySettings(input: {
  description: string;
  studyId: string;
  title: string;
  userId: string;
}) {
  return updateStudySettingsRecord(input);
}

// 확인한 제목이 일치하는 소유자의 스터디를 삭제한다.
export async function deleteStudy(input: {
  confirmText: string;
  studyId: string;
  userId: string;
}) {
  return deleteOwnedStudy(input);
}
