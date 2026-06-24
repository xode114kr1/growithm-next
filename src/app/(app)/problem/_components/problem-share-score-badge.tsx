import { isWithinDayDifference } from "@/utils/date";
import { PROBLEM_SHARE_SCORE_DAY_DIFFERENCE } from "@/utils/problem";

export default function ProblemShareScoreBadge({
  currentTime,
  submittedAtText,
}: {
  currentTime: string;
  submittedAtText: string | null;
}) {
  const canReceiveShareScore = isWithinDayDifference({
    currentTime,
    dayDifference: PROBLEM_SHARE_SCORE_DAY_DIFFERENCE,
    targetTime: submittedAtText,
  });

  if (!canReceiveShareScore) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-secondary-container/60 px-2.5 py-1 text-body-sm font-semibold text-primary">
      XP 획득 가능
    </span>
  );
}
