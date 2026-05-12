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

export async function shareProblemToStudies(
  _prevState: ProblemShareActionState,
  formData: FormData,
): Promise<ProblemShareActionState> {
  const session = await auth();
  const userId = session?.user?.id;
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

  const problem = await prisma.problemSubmission.findFirst({
    select: {
      id: true,
      status: true,
      submittedAtText: true,
      tier: true,
      userId: true,
    },
    where: {
      id: problemId,
      userId,
    },
  });

  if (!problem) {
    return createShareErrorState("공유할 수 있는 문제를 찾을 수 없습니다.");
  }

  if (problem.status !== ProblemSubmissionStatus.COMPLETED) {
    return createShareErrorState("메모 작성이 완료된 문제만 공유할 수 있습니다.");
  }

  const studies = await prisma.study.findMany({
    select: {
      id: true,
    },
    where: {
      id: {
        in: studyIds,
      },
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  });
  const authorizedStudyIds = studies.map((study) => study.id);

  if (authorizedStudyIds.length === 0) {
    return createShareErrorState("공유할 수 있는 스터디를 찾을 수 없습니다.");
  }

  const existingShares = await prisma.studyProblemShare.findMany({
    select: {
      studyId: true,
    },
    where: {
      problemSubmissionId: problem.id,
      studyId: {
        in: authorizedStudyIds,
      },
    },
  });
  const existingStudyIds = new Set(existingShares.map((share) => share.studyId));
  const newStudyIds = authorizedStudyIds.filter(
    (studyId) => !existingStudyIds.has(studyId),
  );
  const skippedCount = studyIds.length - newStudyIds.length;

  if (newStudyIds.length === 0) {
    return {
      error: null,
      sharedCount: 0,
      skippedCount,
      status: "success",
    };
  }

  const shareScore = isWithinShareScoreWindow(problem.submittedAtText)
    ? getProblemShareScore(problem.tier)
    : 0;

  await prisma.$transaction(async (tx) => {
    await tx.studyProblemShare.createMany({
      data: newStudyIds.map((studyId) => ({
        problemSubmissionId: problem.id,
        score: shareScore,
        studyId,
        userId,
      })),
      skipDuplicates: true,
    });

    if (shareScore > 0) {
      await tx.study.updateMany({
        data: {
          score: {
            increment: shareScore,
          },
        },
        where: {
          id: {
            in: newStudyIds,
          },
        },
      });
    }
  });

  revalidatePath(`/problem/${problem.id}`);
  revalidatePath("/problem");
  revalidatePath("/study");

  for (const studyId of newStudyIds) {
    revalidatePath(`/study/${studyId}/overview`);
    revalidatePath(`/study/${studyId}/problems`);
  }

  return {
    error: null,
    sharedCount: newStudyIds.length,
    skippedCount,
    status: "success",
  };
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

function createShareErrorState(error: string): ProblemShareActionState {
  return {
    error,
    sharedCount: 0,
    skippedCount: 0,
    status: "error",
  };
}

function getProblemShareScore(tier: string | null) {
  const normalizedTier = tier?.toLowerCase() ?? "";

  if (normalizedTier.includes("ruby")) return 60;
  if (normalizedTier.includes("diamond")) return 50;
  if (normalizedTier.includes("platinum")) return 40;
  if (normalizedTier.includes("gold")) return 30;
  if (normalizedTier.includes("silver")) return 20;
  if (normalizedTier.includes("bronze")) return 10;

  const levelMatch = normalizedTier.match(/(?:lv\.?|level)\s*(\d+)/);
  if (levelMatch) {
    return Math.max(0, Number(levelMatch[1]) * 10);
  }

  return 0;
}

function isWithinShareScoreWindow(submittedAtText: string | null) {
  const submittedAt = parseSubmittedAt(submittedAtText);

  if (!submittedAt) {
    return false;
  }

  const elapsedMs = Date.now() - submittedAt.getTime();

  return elapsedMs >= 0 && elapsedMs <= 2 * 24 * 60 * 60 * 1000;
}

function parseSubmittedAt(submittedAtText: string | null) {
  if (!submittedAtText) {
    return null;
  }

  const trimmed = submittedAtText.trim();
  const isoLikeMatch = trimmed.match(
    /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
  );

  if (isoLikeMatch) {
    return new Date(
      Number(isoLikeMatch[1]),
      Number(isoLikeMatch[2]) - 1,
      Number(isoLikeMatch[3]),
      Number(isoLikeMatch[4] ?? 0),
      Number(isoLikeMatch[5] ?? 0),
      Number(isoLikeMatch[6] ?? 0),
    );
  }

  const numericParts = trimmed.match(/\d+/g);

  if (numericParts && numericParts.length >= 3) {
    return new Date(
      Number(numericParts[0]),
      Number(numericParts[1]) - 1,
      Number(numericParts[2]),
      Number(numericParts[3] ?? 0),
      Number(numericParts[4] ?? 0),
      Number(numericParts[5] ?? 0),
    );
  }

  const parsed = new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
