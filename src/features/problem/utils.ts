import { ProblemSubmissionStatus } from "@/generated/prisma/enums";

export function getProblemStatusLabel(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "Completed"
    : "Memo pending";
}

export function getProblemStatusDescription(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "Ready to share"
    : "Write a memo to share";
}

export function getProblemStatusBadgeClass(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "inline-flex items-center rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed"
    : "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-body-sm font-semibold text-amber-700";
}

export function formatAccuracy(accuracy: number | null) {
  return accuracy === null ? null : `${accuracy}%`;
}

export function formatScore(score: number | null, scoreMax: number | null) {
  if (score === null) {
    return null;
  }

  return scoreMax === null ? String(score) : `${score} / ${scoreMax}`;
}

export function getSubmittedLabel(submittedAtText: string | null) {
  return submittedAtText ?? "Submitted";
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(date);
}

export function getTierBadgeClass(tier: string) {
  if (tier.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  return "badge-tier-silver";
}
