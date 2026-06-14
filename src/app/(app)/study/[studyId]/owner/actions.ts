"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import {
  cancelStudyInvite as cancelStudyInviteCommand,
  createStudyInvite as createStudyInviteCommand,
  deleteStudy as deleteStudyCommand,
  removeStudyMember as removeStudyMemberCommand,
  updateStudyMemberRole as updateStudyMemberRoleCommand,
  updateStudySettings as updateStudySettingsCommand,
} from "@/services/studies/study.command";
import {
  validateStudyInviteTarget,
  validateStudySettingsInput,
} from "@/services/studies/study.validator";

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

  const result = await createStudyInviteCommand({ studyId, target, userId });

  if (result.error) {
    return createInviteErrorState(target, result.error);
  }

  revalidatePath(`/study/${studyId}/owner`);

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

  await cancelStudyInviteCommand({ inviteId, studyId, userId });

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

  await updateStudyMemberRoleCommand({ memberId, role, studyId, userId });

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

  await removeStudyMemberCommand({ memberId, studyId, userId });

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

  const updated = await updateStudySettingsCommand({
    description,
    studyId,
    title,
    userId,
  });

  if (!updated) {
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

  const deleted = await deleteStudyCommand({ confirmText, studyId, userId });

  if (!deleted) {
    return;
  }

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
