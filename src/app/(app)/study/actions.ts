"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import {
  acceptStudyInvite as acceptStudyInviteCommand,
  createStudy as createStudyCommand,
  declineStudyInvite as declineStudyInviteCommand,
} from "@/server/studies/study.service";
import { validateStudyInput } from "@/server/studies/study.schema";

export type CreateStudyActionState = {
  description: string;
  error: string | null;
  status: "idle" | "error" | "success";
  studyId: string | null;
  title: string;
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

export async function acceptStudyInvite(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const inviteId = getFormValue(formData, "inviteId");

  if (!userId || !inviteId) {
    return;
  }

  const studyId = await acceptStudyInviteCommand({ inviteId, userId });

  if (!studyId) {
    return;
  }

  revalidatePath("/study");
  revalidatePath(`/study/${studyId}/overview`);
}

export async function declineStudyInvite(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const inviteId = getFormValue(formData, "inviteId");

  if (!userId || !inviteId) {
    return;
  }

  await declineStudyInviteCommand({ inviteId, userId });

  revalidatePath("/study");
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

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
