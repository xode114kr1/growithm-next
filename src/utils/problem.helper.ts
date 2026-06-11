import type { Prisma } from "@/generated/prisma/client";
import type {
  ProblemFiltersState,
  ProblemShareResult,
  ProblemSort,
} from "@/types/problem";

// 문제 목록 필터를 Prisma 조회 조건으로 변환한다.
export function buildProblemWhere(filters: ProblemFiltersState) {
  const where: Prisma.ProblemSubmissionWhereInput = {};

  if (filters.platform) where.platform = filters.platform;
  if (filters.tier) where.tier = filters.tier;

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { problemId: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

// 선택한 문제 정렬 기준을 Prisma 정렬 조건으로 변환한다.
export function buildProblemOrderBy(sort: ProblemSort) {
  const orderBy: Prisma.ProblemSubmissionOrderByWithRelationInput[] = [];

  if (sort === "oldest") orderBy.push({ createdAt: "asc" });
  else if (sort === "title") orderBy.push({ title: "asc" });
  else if (sort === "platform") orderBy.push({ platform: "asc" });
  else orderBy.push({ createdAt: "desc" });

  orderBy.push({ id: "asc" });

  return orderBy;
}

// 문제 공유 실패 결과를 일관된 형태로 생성한다.
export function createProblemShareError(error: string): ProblemShareResult {
  return { error, newStudyIds: [], skippedCount: 0 };
}

// 문제 티어에 해당하는 스터디 공유 점수를 계산한다.
export function getProblemShareScore(tier: string | null) {
  const normalizedTier = tier?.toLowerCase() ?? "";

  if (normalizedTier.includes("ruby")) return 60;
  if (normalizedTier.includes("diamond")) return 50;
  if (normalizedTier.includes("platinum")) return 40;
  if (normalizedTier.includes("gold")) return 30;
  if (normalizedTier.includes("silver")) return 20;
  if (normalizedTier.includes("bronze")) return 10;

  const levelMatch = normalizedTier.match(/(?:lv\.?|level)\s*(\d+)/);

  return levelMatch ? Math.max(0, Number(levelMatch[1]) * 10) : 0;
}

// 문제 제출 시각이 공유 점수 인정 기간 안인지 확인한다.
export function isWithinShareScoreWindow(submittedAtText: string | null) {
  const submittedAt = parseSubmittedAt(submittedAtText);

  if (!submittedAt) return false;

  const elapsedMs = Date.now() - submittedAt.getTime();

  return elapsedMs >= 0 && elapsedMs <= 2 * 24 * 60 * 60 * 1000;
}

// 제출 시각 문자열을 Date 객체로 변환한다.
function parseSubmittedAt(submittedAtText: string | null) {
  if (!submittedAtText) return null;

  const trimmed = submittedAtText.trim();
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
