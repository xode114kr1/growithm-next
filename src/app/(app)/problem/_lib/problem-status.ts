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
