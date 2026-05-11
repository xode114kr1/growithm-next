"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

const INVITE_TARGET_MAX_LENGTH = 120;
const INVITE_EXPIRATION_DAYS = 7;

export type CreateStudyInviteActionState = {
  error: string | null;
  status: "idle" | "error" | "success";
  target: string;
};

export async function createStudyInvite(
  _prevState: CreateStudyInviteActionState,
  formData: FormData,
): Promise<CreateStudyInviteActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const studyId = getFormValue(formData, "studyId");
  const target = getFormValue(formData, "target").trim();

  if (!userId) {
    return createInviteErrorState(target, "로그인이 필요합니다.");
  }

  if (!studyId) {
    return createInviteErrorState(target, "스터디 정보를 찾을 수 없습니다.");
  }

  if (!target) {
    return createInviteErrorState(target, "초대할 사용자 이름 또는 이메일을 입력해주세요.");
  }

  if (target.length > INVITE_TARGET_MAX_LENGTH) {
    return createInviteErrorState(
      target,
      `초대 대상은 ${INVITE_TARGET_MAX_LENGTH.toLocaleString()}자 이하로 입력해주세요.`,
    );
  }

  const study = await prisma.study.findFirst({
    select: {
      id: true,
    },
    where: {
      id: studyId,
      ownerId: userId,
    },
  });

  if (!study) {
    return createInviteErrorState(target, "초대를 보낼 수 있는 스터디를 찾을 수 없습니다.");
  }

  const targetUser = await prisma.user.findFirst({
    select: {
      id: true,
      name: true,
    },
    where: {
      OR: [
        {
          email: target,
        },
        {
          name: target,
        },
      ],
    },
  });

  if (!targetUser) {
    return createInviteErrorState(target, "해당 사용자 이름 또는 이메일을 찾을 수 없습니다.");
  }

  if (targetUser.id === userId) {
    return createInviteErrorState(target, "본인은 초대할 수 없습니다.");
  }

  const existingMember = await prisma.studyMember.findUnique({
    select: {
      id: true,
    },
    where: {
      studyId_userId: {
        studyId: study.id,
        userId: targetUser.id,
      },
    },
  });

  if (existingMember) {
    return createInviteErrorState(target, "이미 스터디에 참여 중인 사용자입니다.");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRATION_DAYS);

  await prisma.studyInvite.upsert({
    create: {
      expiresAt,
      invitedById: userId,
      status: "PENDING",
      studyId: study.id,
      target: targetUser.name ?? target,
      targetUserId: targetUser.id,
    },
    update: {
      expiresAt,
      invitedById: userId,
      status: "PENDING",
    },
    where: {
      studyId_targetUserId: {
        studyId: study.id,
        targetUserId: targetUser.id,
      },
    },
  });

  revalidatePath(`/study/${study.id}/owner`);

  return {
    error: null,
    status: "success",
    target: "",
  };
}

export async function cancelStudyInvite(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const inviteId = getFormValue(formData, "inviteId");
  const studyId = getFormValue(formData, "studyId");

  if (!userId || !inviteId || !studyId) {
    return;
  }

  await prisma.studyInvite.updateMany({
    data: {
      status: "CANCELED",
    },
    where: {
      id: inviteId,
      status: "PENDING",
      study: {
        id: studyId,
        ownerId: userId,
      },
    },
  });

  revalidatePath(`/study/${studyId}/owner`);
}

function createInviteErrorState(target: string, error: string): CreateStudyInviteActionState {
  return {
    error,
    status: "error",
    target,
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
