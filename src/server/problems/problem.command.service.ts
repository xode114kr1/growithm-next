import "server-only";

import {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";
import {
  createProblemShares,
  findAuthorizedStudyIds,
  findOwnedProblemForSharing,
  updateProblemMemoRecord,
} from "@/server/problems/problem.repository";
import type { ProblemShareResult } from "@/types/problem";
import { isWithinDayDifference } from "@/utils/date";
import { PROBLEM_SHARE_SCORE_DAY_DIFFERENCE } from "@/utils/problem";

const baekjoonBaseScores: Record<string, number> = {
  bronze: 1,
  diamond: 6_250_000,
  gold: 2_500,
  platinum: 125_000,
  silver: 50,
};

const baekjoonTierMultipliers: Record<string, number> = {
  i: 5,
  ii: 4,
  iii: 3,
  iv: 2,
  v: 1,
};

const programmersLevelScores: Record<number, number> = {
  1: 3,
  2: 150,
  3: 7_500,
  4: 375_000,
  5: 18_750_000,
};

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

// 플랫폼과 티어를 기준으로 문제 경험치 점수를 계산한다.
export function getProblemExperienceScore({
  platform,
  tier,
}: {
  platform: ProblemPlatform;
  tier: string | null | undefined;
}) {
  if (!tier) return 0;

  if (platform === ProblemPlatform.BAEKJOON) {
    return (
      getBaekjoonExperienceScore(tier) || getProgrammersExperienceScore(tier)
    );
  }

  if (platform === ProblemPlatform.PROGRAMMERS) {
    return (
      getProgrammersExperienceScore(tier) || getBaekjoonExperienceScore(tier)
    );
  }

  return 0;
}

// 문제 공유 실패 결과를 일관된 형태로 생성한다.
function createProblemShareError(error: string): ProblemShareResult {
  return { error, newStudyIds: [], skippedCount: 0 };
}

// 백준 티어 문자열을 경험치 점수로 변환한다.
function getBaekjoonExperienceScore(tier: string) {
  const normalizedTier = tier.trim().toLowerCase();
  const tierMatch = normalizedTier.match(
    /(bronze|silver|gold|platinum|diamond)\s+(i{1,3}|iv|v)\b/,
  );

  if (!tierMatch) return 0;

  const baseScore = baekjoonBaseScores[tierMatch[1]];
  const multiplier = baekjoonTierMultipliers[tierMatch[2]];

  return baseScore && multiplier ? baseScore * multiplier : 0;
}

// 프로그래머스 레벨 문자열을 경험치 점수로 변환한다.
function getProgrammersExperienceScore(tier: string) {
  const levelMatch = tier.trim().toLowerCase().match(/(?:lv\.?|level)\s*(\d+)/);

  if (!levelMatch) return 0;

  return programmersLevelScores[Number(levelMatch[1])] ?? 0;
}
