"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  validateStudyInviteTarget,
  validateStudySettingsInput,
} from "@/services/studies/study.validator";

const INVITE_EXPIRATION_DAYS = 7;

export type CreateStudyInviteActionState = {
  error: string | null;
  status: "idle" | "error" | "success";
  target: string;
};

export type UpdateStudySettingsActionState = {
  description: string;
  error: string | null;
  status: "idle" | "error" | "success";
  title: string;
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

  const validationError = validateStudyInviteTarget(target);

  if (validationError) {
    return createInviteErrorState(target, validationError);
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

export async function updateStudyMemberRole(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const studyId = getFormValue(formData, "studyId");
  const memberId = getFormValue(formData, "memberId");
  const role = getFormValue(formData, "role");

  if (!userId || !studyId || !memberId || !isEditableMemberRole(role)) {
    return;
  }

  const study = await prisma.study.findFirst({
    select: {
      ownerId: true,
    },
    where: {
      id: studyId,
      ownerId: userId,
    },
  });

  if (!study) {
    return;
  }

  await prisma.studyMember.updateMany({
    data: {
      role,
    },
    where: {
      id: memberId,
      studyId,
      userId: {
        not: study.ownerId,
      },
    },
  });

  revalidatePath(`/study/${studyId}/owner`);
  revalidatePath(`/study/${studyId}/members`);
  revalidatePath(`/study/${studyId}/overview`);
}

export async function removeStudyMember(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const studyId = getFormValue(formData, "studyId");
  const memberId = getFormValue(formData, "memberId");

  if (!userId || !studyId || !memberId) {
    return;
  }

  const study = await prisma.study.findFirst({
    select: {
      ownerId: true,
    },
    where: {
      id: studyId,
      ownerId: userId,
    },
  });

  if (!study) {
    return;
  }

  await prisma.studyMember.deleteMany({
    where: {
      id: memberId,
      studyId,
      userId: {
        not: study.ownerId,
      },
    },
  });

  revalidatePath(`/study/${studyId}/owner`);
  revalidatePath(`/study/${studyId}/members`);
  revalidatePath(`/study/${studyId}/overview`);
}

export async function updateStudySettings(
  _prevState: UpdateStudySettingsActionState,
  formData: FormData,
): Promise<UpdateStudySettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const studyId = getFormValue(formData, "studyId");
  const title = getFormValue(formData, "title").trim();
  const description = getFormValue(formData, "description").trim();

  if (!userId) {
    return createStudySettingsErrorState({ description, error: "로그인이 필요합니다.", title });
  }

  if (!studyId) {
    return createStudySettingsErrorState({
      description,
      error: "스터디 정보를 찾을 수 없습니다.",
      title,
    });
  }

  const validationError = validateStudySettingsInput({ description, title });

  if (validationError) {
    return createStudySettingsErrorState({
      description,
      error: validationError,
      title,
    });
  }

  const updateResult = await prisma.study.updateMany({
    data: {
      description: description || null,
      title,
    },
    where: {
      id: studyId,
      ownerId: userId,
    },
  });

  if (updateResult.count === 0) {
    return createStudySettingsErrorState({
      description,
      error: "수정할 수 있는 스터디를 찾을 수 없습니다.",
      title,
    });
  }

  revalidatePath("/study");
  revalidatePath(`/study/${studyId}/owner`);
  revalidatePath(`/study/${studyId}/overview`);
  revalidatePath(`/study/${studyId}/members`);

  return {
    description,
    error: null,
    status: "success",
    title,
  };
}

export async function deleteStudy(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const studyId = getFormValue(formData, "studyId");
  const confirmText = getFormValue(formData, "confirmText");

  if (!userId || !studyId || !confirmText) {
    return;
  }

  const study = await prisma.study.findFirst({
    select: {
      id: true,
      title: true,
    },
    where: {
      id: studyId,
      ownerId: userId,
    },
  });

  if (!study || confirmText !== study.title) {
    return;
  }

  await prisma.study.delete({
    where: {
      id: study.id,
    },
  });

  revalidatePath("/study");
  redirect("/study");
}

function createInviteErrorState(target: string, error: string): CreateStudyInviteActionState {
  return {
    error,
    status: "error",
    target,
  };
}

function createStudySettingsErrorState({
  description,
  error,
  title,
}: {
  description: string;
  error: string;
  title: string;
}): UpdateStudySettingsActionState {
  return {
    description,
    error,
    status: "error",
    title,
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function isEditableMemberRole(role: string): role is "LEADER" | "MEMBER" {
  return role === "LEADER" || role === "MEMBER";
}
