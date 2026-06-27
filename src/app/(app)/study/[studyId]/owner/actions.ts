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
} from "@/server/studies/study.command.service";
import {
  validateStudyInviteTarget,
  validateStudySettingsInput,
} from "@/server/studies/study.schema";
import type { ActionState } from "@/types/action-state";

export type CreateStudyInviteActionState = ActionState & {
  target: string;
};

export type UpdateStudySettingsActionState = ActionState & {
  description: string;
  title: string;
};

export type StudyMemberActionState = ActionState;

export type CancelStudyInviteActionState = ActionState;

export type DeleteStudyActionState = ActionState<"idle" | "error"> & {
  confirmText: string;
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

export async function cancelStudyInvite(
  _prevState: CancelStudyInviteActionState,
  formData: FormData,
): Promise<CancelStudyInviteActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const inviteId = getFormValue(formData, "inviteId");
  const studyId = getFormValue(formData, "studyId");

  if (!userId) {
    return createCancelInviteErrorState("로그인이 필요합니다.");
  }

  if (!inviteId || !studyId) {
    return createCancelInviteErrorState("초대 정보를 찾을 수 없습니다.");
  }

  try {
    const canceled = await cancelStudyInviteCommand({ inviteId, studyId, userId });

    if (!canceled) {
      return createCancelInviteErrorState("취소할 수 있는 초대를 찾을 수 없습니다.");
    }

    revalidatePath(`/study/${studyId}/owner`);

    return createCancelInviteSuccessState();
  } catch (error) {
    console.error("Failed to cancel study invite", error);

    return createCancelInviteErrorState(
      "초대를 취소하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }
}

export async function updateStudyMemberRole(
  _prevState: StudyMemberActionState,
  formData: FormData,
): Promise<StudyMemberActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const studyId = getFormValue(formData, "studyId");
  const memberId = getFormValue(formData, "memberId");
  const role = getFormValue(formData, "role");

  if (!userId) {
    return createStudyMemberErrorState("로그인이 필요합니다.");
  }

  if (!studyId || !memberId) {
    return createStudyMemberErrorState("멤버 정보를 찾을 수 없습니다.");
  }

  if (!isEditableMemberRole(role)) {
    return createStudyMemberErrorState("변경할 수 없는 역할입니다.");
  }

  try {
    const updated = await updateStudyMemberRoleCommand({
      memberId,
      role,
      studyId,
      userId,
    });

    if (!updated) {
      return createStudyMemberErrorState("역할을 변경할 수 있는 멤버를 찾을 수 없습니다.");
    }

    revalidatePath(`/study/${studyId}/owner`);
    revalidatePath(`/study/${studyId}/members`);
    revalidatePath(`/study/${studyId}/overview`);

    return createStudyMemberSuccessState();
  } catch (error) {
    console.error("Failed to update study member role", error);

    return createStudyMemberErrorState(
      "멤버 역할을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }
}

export async function removeStudyMember(
  _prevState: StudyMemberActionState,
  formData: FormData,
): Promise<StudyMemberActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const studyId = getFormValue(formData, "studyId");
  const memberId = getFormValue(formData, "memberId");

  if (!userId) {
    return createStudyMemberErrorState("로그인이 필요합니다.");
  }

  if (!studyId || !memberId) {
    return createStudyMemberErrorState("멤버 정보를 찾을 수 없습니다.");
  }

  try {
    const removed = await removeStudyMemberCommand({ memberId, studyId, userId });

    if (!removed) {
      return createStudyMemberErrorState("내보낼 수 있는 멤버를 찾을 수 없습니다.");
    }

    revalidatePath(`/study/${studyId}/owner`);
    revalidatePath(`/study/${studyId}/members`);
    revalidatePath(`/study/${studyId}/overview`);

    return createStudyMemberSuccessState();
  } catch (error) {
    console.error("Failed to remove study member", error);

    return createStudyMemberErrorState(
      "멤버를 내보내지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }
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

export async function deleteStudy(
  _prevState: DeleteStudyActionState,
  formData: FormData,
): Promise<DeleteStudyActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const studyId = getFormValue(formData, "studyId");
  const confirmText = getFormValue(formData, "confirmText").trim();

  if (!userId) {
    return createDeleteStudyErrorState({
      confirmText,
      error: "로그인이 필요합니다.",
    });
  }

  if (!studyId) {
    return createDeleteStudyErrorState({
      confirmText,
      error: "스터디 정보를 찾을 수 없습니다.",
    });
  }

  if (!confirmText) {
    return createDeleteStudyErrorState({
      confirmText,
      error: "확인 문구를 입력해주세요.",
    });
  }

  try {
    const deleted = await deleteStudyCommand({ confirmText, studyId, userId });

    if (!deleted) {
      return createDeleteStudyErrorState({
        confirmText,
        error: "스터디 이름이 일치하지 않거나 삭제 권한이 없습니다.",
      });
    }

    revalidatePath("/study");
  } catch (error) {
    console.error("Failed to delete study", error);

    return createDeleteStudyErrorState({
      confirmText,
      error: "스터디를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.",
    });
  }

  redirect("/study");
}

function createInviteErrorState(target: string, error: string): CreateStudyInviteActionState {
  return {
    error,
    status: "error",
    target,
  };
}

function createCancelInviteSuccessState(): CancelStudyInviteActionState {
  return {
    error: null,
    status: "success",
  };
}

function createCancelInviteErrorState(error: string): CancelStudyInviteActionState {
  return {
    error,
    status: "error",
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

function createStudyMemberSuccessState(): StudyMemberActionState {
  return {
    error: null,
    status: "success",
  };
}

function createStudyMemberErrorState(error: string): StudyMemberActionState {
  return {
    error,
    status: "error",
  };
}

function createDeleteStudyErrorState({
  confirmText,
  error,
}: {
  confirmText: string;
  error: string;
}): DeleteStudyActionState {
  return {
    confirmText,
    error,
    status: "error",
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function isEditableMemberRole(role: string): role is "LEADER" | "MEMBER" {
  return role === "LEADER" || role === "MEMBER";
}
