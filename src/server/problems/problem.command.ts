import "server-only";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import {
  createProblemShares,
  findAuthorizedStudyIds,
  findExistingSharedStudyIds,
  findOwnedProblemForSharing,
  updateProblemMemoRecord,
} from "@/server/problems/problem.persistence.server";
import {
  createProblemShareError,
  getProblemShareScore,
  isWithinShareScoreWindow,
} from "@/server/problems/problem.helper";
import type { ProblemShareResult } from "@/types/problem";

// 사용자가 소유한 문제 제출의 메모와 상태를 수정한다.
export async function updateProblemMemo({
  memo,
  problemId,
  userId,
}: {
  memo: string;
  problemId: string;
  userId: string;
}) {
  return updateProblemMemoRecord({ memo, problemId, userId });
}

// 완료한 문제를 권한이 있는 스터디에 공유하고 점수를 반영한다.
export async function shareProblemWithStudies({
  problemId,
  studyIds,
  userId,
}: {
  problemId: string;
  studyIds: string[];
  userId: string;
}): Promise<ProblemShareResult> {
  const problem = await findOwnedProblemForSharing({ problemId, userId });

  if (!problem) {
    return createProblemShareError("공유할 수 있는 문제를 찾을 수 없습니다.");
  }

  if (problem.status !== ProblemSubmissionStatus.COMPLETED) {
    return createProblemShareError(
      "메모 작성이 완료된 문제만 공유할 수 있습니다.",
    );
  }

  const authorizedStudyIds = await findAuthorizedStudyIds({ studyIds, userId });

  if (authorizedStudyIds.length === 0) {
    return createProblemShareError("공유할 수 있는 스터디를 찾을 수 없습니다.");
  }

  const existingStudyIds = new Set(
    await findExistingSharedStudyIds({
      problemId: problem.id,
      studyIds: authorizedStudyIds,
    }),
  );
  const newStudyIds = authorizedStudyIds.filter(
    (studyId) => !existingStudyIds.has(studyId),
  );
  const skippedCount = studyIds.length - newStudyIds.length;

  if (newStudyIds.length > 0) {
    const shareScore = isWithinShareScoreWindow(problem.submittedAtText)
      ? getProblemShareScore(problem.tier)
      : 0;

    await createProblemShares({
      problemId: problem.id,
      shareScore,
      studyIds: newStudyIds,
      userId,
    });
  }

  return { error: null, newStudyIds, skippedCount };
}
