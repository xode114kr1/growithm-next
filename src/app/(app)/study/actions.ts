"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import {
  acceptStudyInvite as acceptStudyInviteCommand,
  createStudy as createStudyCommand,
  rejectStudyInvite as rejectStudyInviteCommand,
} from "@/server/studies/study.command.service";
import { validateStudyInput } from "@/server/studies/study.schema";

export type CreateStudyActionState = {
  description: string;
  error: string | null;
  status: "idle" | "error" | "success";
  studyId: string | null;
  title: string;
};

export type StudyInviteActionState = {
  error: string | null;
  status: "idle" | "error" | "success";
};

export async function createStudy(
  _prevState: CreateStudyActionState,
  formData: FormData,
): Promise<CreateStudyActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const title = getFormValue(formData, "title").trim();
  const description = getFormValue(formData, "description").trim();

  if (!userId) {
    return createErrorState({
      description,
      error: "로그인이 필요합니다.",
      title,
    });
  }

  const validationError = validateStudyInput({ description, title });

  if (validationError) {
    return createErrorState({
      description,
      error: validationError,
      title,
    });
  }

  try {
    const study = await createStudyCommand({ description, title, userId });

    revalidatePath("/study");

    return {
      description,
      error: null,
      status: "success",
      studyId: study.id,
      title,
    };
  } catch (error) {
    console.error("Failed to create study", error);

    return createErrorState({
      description,
      error: "스터디를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.",
      title,
    });
  }
}

export async function acceptStudyInvite(
  _prevState: StudyInviteActionState,
  formData: FormData,
): Promise<StudyInviteActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const inviteId = getFormValue(formData, "inviteId");

  if (!userId) {
    return createStudyInviteErrorState("로그인이 필요합니다.");
  }

  if (!inviteId) {
    return createStudyInviteErrorState("초대 정보를 찾을 수 없습니다.");
  }

  try {
    const studyId = await acceptStudyInviteCommand({ inviteId, userId });

    if (!studyId) {
      return createStudyInviteErrorState("수락할 수 있는 초대를 찾을 수 없습니다.");
    }

    revalidatePath("/study");
    revalidatePath(`/study/${studyId}/overview`);

    return createStudyInviteSuccessState();
  } catch (error) {
    console.error("Failed to accept study invite", error);

    return createStudyInviteErrorState(
      "스터디 초대를 수락하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }
}

export async function rejectStudyInvite(
  _prevState: StudyInviteActionState,
  formData: FormData,
): Promise<StudyInviteActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const inviteId = getFormValue(formData, "inviteId");

  if (!userId) {
    return createStudyInviteErrorState("로그인이 필요합니다.");
  }

  if (!inviteId) {
    return createStudyInviteErrorState("초대 정보를 찾을 수 없습니다.");
  }

  try {
    await rejectStudyInviteCommand({ inviteId, userId });
    revalidatePath("/study");

    return createStudyInviteSuccessState();
  } catch (error) {
    console.error("Failed to reject study invite", error);

    return createStudyInviteErrorState(
      "스터디 초대를 거절하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }
}

function createErrorState({
  description,
  error,
  title,
}: {
  description: string;
  error: string;
  title: string;
}): CreateStudyActionState {
  return {
    description,
    error,
    status: "error",
    studyId: null,
    title,
  };
}

function createStudyInviteSuccessState(): StudyInviteActionState {
  return {
    error: null,
    status: "success",
  };
}

function createStudyInviteErrorState(error: string): StudyInviteActionState {
  return {
    error,
    status: "error",
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
