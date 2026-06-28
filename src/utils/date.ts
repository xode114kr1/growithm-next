// 날짜를 한국어 짧은 날짜 형식으로 변환한다.
export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// 제출 시각 문자열을 날짜만 표시하는 ISO 형식으로 변환한다.
export function formatSubmittedDateText(
  submittedAtText: string | null | undefined,
) {
  if (!submittedAtText) return null;

  const dateParts = submittedAtText.match(/\d+/g);

  if (!dateParts || dateParts.length < 3) {
    return submittedAtText;
  }

  const [year, month, day] = dateParts;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// 날짜를 현재 시점 기준의 상대 시간 문자열로 변환한다.
export function formatRelativeDate(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} days ago`;
}

type DateInput = Date | number | string;

// 두 시각의 차이가 지정한 날짜 수 이내인지 확인한다.
export function isWithinDayDifference({
  currentTime,
  dayDifference,
  targetTime,
}: {
  currentTime: DateInput;
  dayDifference: number;
  targetTime: DateInput | null | undefined;
}) {
  if (dayDifference < 0 || targetTime === null || targetTime === undefined) {
    return false;
  }

  const currentDate = parseDateInput(currentTime);
  const targetDate = parseDateInput(targetTime);

  if (!currentDate || !targetDate) return false;

  const elapsedMs = currentDate.getTime() - targetDate.getTime();
  const allowedDifferenceMs = dayDifference * 24 * 60 * 60 * 1000;

  return elapsedMs >= 0 && elapsedMs <= allowedDifferenceMs;
}

// 시간대가 없는 제출 시각 문자열은 한국 표준시로 변환한다.
function parseDateInput(value: DateInput) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const trimmed = value.trim();

  if (!trimmed) return null;

  if (hasTimeZone(trimmed)) {
    const date = new Date(trimmed);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const numericParts = trimmed.match(/\d+/g);

  if (!numericParts || numericParts.length < 3) return null;

  const [year, month, day, hour = "0", minute = "0", second = "0"] =
    numericParts;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - 9,
      Number(minute),
      Number(second),
    ),
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function hasTimeZone(value: string) {
  return /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
}
