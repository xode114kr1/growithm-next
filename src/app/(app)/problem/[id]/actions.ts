"use server";

import { revalidatePath } from "next/cache";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

const MAX_MEMO_LENGTH = 2000;

export type ProblemMemoActionState = {
  error: string | null;
  memo: string;
  status: "idle" | "error" | "success";
};

export async function updateProblemMemo(
  _prevState: ProblemMemoActionState,
  formData: FormData,
): Promise<ProblemMemoActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const problemId = getFormValue(formData, "problemId");
  const memo = getFormValue(formData, "memo").trim();

  if (!userId) {
    return {
      error: "로그인이 필요합니다.",
      memo,
      status: "error",
    };
  }

  if (!problemId) {
    return {
      error: "문제 정보를 찾을 수 없습니다.",
      memo,
      status: "error",
    };
  }

  if (memo.length > MAX_MEMO_LENGTH) {
    return {
      error: `메모는 ${MAX_MEMO_LENGTH.toLocaleString()}자 이하로 작성해주세요.`,
      memo,
      status: "error",
    };
  }

  const updateResult = await prisma.problemSubmission.updateMany({
    data: {
      memo: memo || null,
      status: memo
        ? ProblemSubmissionStatus.COMPLETED
        : ProblemSubmissionStatus.PENDING,
    },
    where: {
      id: problemId,
      userId,
    },
  });

  if (updateResult.count === 0) {
    return {
      error: "수정할 수 있는 문제를 찾을 수 없습니다.",
      memo,
      status: "error",
    };
  }

  revalidatePath(`/problem/${problemId}`);
  revalidatePath("/problem");

  return {
    error: null,
    memo,
    status: "success",
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
