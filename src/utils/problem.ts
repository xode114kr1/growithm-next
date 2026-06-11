import { ProblemSubmissionStatus } from "@/generated/prisma/enums";

// 문제 제출 상태의 표시 이름을 반환한다.
export function getProblemStatusLabel(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "Completed"
    : "Memo pending";
}

// 문제 제출 상태의 보조 설명 문구를 반환한다.
export function getProblemStatusDescription(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "Ready to share"
    : "Write a memo to share";
}

// 문제 제출 상태에 맞는 배지 스타일 클래스를 반환한다.
export function getProblemStatusBadgeClass(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "inline-flex items-center rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed"
    : "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-body-sm font-semibold text-amber-700";
}

// 정확도 값을 화면 표시용 백분율 문자열로 변환한다.
export function formatAccuracy(accuracy: number | null) {
  return accuracy === null ? null : `${accuracy}%`;
}

// 점수와 최대 점수를 화면 표시용 문자열로 변환한다.
export function formatScore(score: number | null, scoreMax: number | null) {
  if (score === null) return null;

  return scoreMax === null ? String(score) : `${score} / ${scoreMax}`;
}

// 제출 시각이 없을 때 기본 문구를 적용해 표시값을 만든다.
export function getSubmittedLabel(submittedAtText: string | null) {
  return submittedAtText ?? "Submitted";
}

// 문제 티어에 맞는 배지 스타일 클래스를 반환한다.
export function getTierBadgeClass(tier: string | null) {
  if (tier?.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier?.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  return "badge-tier-silver";
}
