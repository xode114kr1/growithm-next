"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import {
  shareProblemWithStudies,
  updateProblemMemo as updateProblemMemoResource,
} from "@/services/problems/problem.server";

const MAX_MEMO_LENGTH = 2000;

export type ProblemMemoActionState = {
  error: string | null;
  memo: string;
  status: "idle" | "error" | "success";
};

export type ProblemShareActionState = {
  error: string | null;
  sharedCount: number;
  skippedCount: number;
  status: "idle" | "error" | "success";
};

export async function updateProblemMemo(
  _prevState: ProblemMemoActionState,
  formData: FormData,
): Promise<ProblemMemoActionState> {
  const userId = await getCurrentUserId();
  const problemId = getFormValue(formData, "problemId");
  const memo = getFormValue(formData, "memo").trim();

  if (!userId) {
    return createMemoErrorState("로그인이 필요합니다.", memo);
  }

  if (!problemId) {
    return createMemoErrorState("문제 정보를 찾을 수 없습니다.", memo);
  }

  if (memo.length > MAX_MEMO_LENGTH) {
    return createMemoErrorState(
      `메모는 ${MAX_MEMO_LENGTH.toLocaleString()}자 이하로 작성해주세요.`,
      memo,
    );
  }

  const updated = await updateProblemMemoResource({ memo, problemId, userId });

  if (!updated) {
    return createMemoErrorState("수정할 수 있는 문제를 찾을 수 없습니다.", memo);
  }

  revalidatePath(`/problem/${problemId}`);
  revalidatePath("/problem");

  return {
    error: null,
    memo,
    status: "success",
  };
}

export async function shareProblemToStudies(
  _prevState: ProblemShareActionState,
  formData: FormData,
): Promise<ProblemShareActionState> {
  const userId = await getCurrentUserId();
  const problemId = getFormValue(formData, "problemId");
  const studyIds = getUniqueFormValues(formData, "studyIds");

  if (!userId) {
    return createShareErrorState("로그인이 필요합니다.");
  }

  if (!problemId) {
    return createShareErrorState("문제 정보를 찾을 수 없습니다.");
  }

  if (studyIds.length === 0) {
    return createShareErrorState("공유할 스터디를 선택해주세요.");
  }

  const result = await shareProblemWithStudies({ problemId, studyIds, userId });

  if (result.error) {
    return createShareErrorState(result.error);
  }

  revalidatePath(`/problem/${problemId}`);
  revalidatePath("/problem");
  revalidatePath("/study");

  for (const studyId of result.newStudyIds) {
    revalidatePath(`/study/${studyId}/overview`);
    revalidatePath(`/study/${studyId}/problems`);
  }

  return {
    error: null,
    sharedCount: result.newStudyIds.length,
    skippedCount: result.skippedCount,
    status: "success",
  };
}

async function getCurrentUserId() {
  const session = await auth();

  return session?.user?.id ?? null;
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getUniqueFormValues(formData: FormData, key: string) {
  return Array.from(
    new Set(
      formData
        .getAll(key)
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function createMemoErrorState(error: string, memo: string): ProblemMemoActionState {
  return {
    error,
    memo,
    status: "error",
  };
}

function createShareErrorState(error: string): ProblemShareActionState {
  return {
    error,
    sharedCount: 0,
    skippedCount: 0,
    status: "error",
  };
}
