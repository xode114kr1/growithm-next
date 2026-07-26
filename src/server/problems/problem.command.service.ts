import "server-only";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import {
  createProblemShares,
  findAuthorizedStudyIds,
  findOwnedProblemForSharing,
  updateProblemMemoRecord,
} from "@/server/problems/problem.repository";
import type { ProblemShareResult } from "@/types/problem";
import { isWithinDayDifference } from "@/utils/date";
import {
  getProblemExperienceScore,
  PROBLEM_SHARE_SCORE_DAY_DIFFERENCE,
} from "@/utils/problem";

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
  const isUpdated = await updateProblemMemoRecord({
    memo,
    problemId,
    userId,
  });

  return isUpdated;
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

  const shareScore = isWithinDayDifference({
    currentTime: new Date(),
    dayDifference: PROBLEM_SHARE_SCORE_DAY_DIFFERENCE,
    targetTime: problem.submittedAtText,
  })
    ? getProblemExperienceScore({
        platform: problem.platform,
        tier: problem.tier,
      })
    : 0;

  const newStudyIds = await createProblemShares({
    problemId: problem.id,
    shareScore,
    studyIds: authorizedStudyIds,
    userId,
  });
  const skippedCount = studyIds.length - newStudyIds.length;

  return { error: null, newStudyIds, skippedCount };
}

// 문제 공유 실패 결과를 일관된 형태로 생성한다.
function createProblemShareError(error: string): ProblemShareResult {
  return { error, newStudyIds: [], skippedCount: 0 };
}
