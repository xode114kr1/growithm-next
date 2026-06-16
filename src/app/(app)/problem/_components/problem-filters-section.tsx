import { getAvailableProblemTiers } from "@/services/problems/problem.query";
import type {
  ProblemFiltersState,
  ProblemPageSearchParams,
  ProblemSort,
} from "@/types/problem";

import ProblemFilters from "./problem-filters";
import { ProblemPlatform } from "@/generated/prisma/enums";

export default async function ProblemFiltersSection({
  searchParams,
  userId,
}: {
  searchParams: ProblemPageSearchParams;
  userId: string | undefined;
}) {
  const filters = parseFilters(searchParams);
  const tiers = await getAvailableProblemTiers(userId);

  return <ProblemFilters filters={filters} tiers={tiers} />;
}

function parseFilters(params: ProblemPageSearchParams): ProblemFiltersState {
  return {
    platform: parsePlatformParam(params.platform),
    q: parseStringParam(params.q),
    sort: parseSortParam(params.sort),
    tier: parseStringParam(params.tier),
  };
}

function parsePlatformParam(platform: string | string[] | undefined) {
  const value = parseStringParam(platform);

  return value === ProblemPlatform.BAEKJOON ||
    value === ProblemPlatform.PROGRAMMERS
    ? value
    : null;
}

function parseSortParam(sort: string | string[] | undefined): ProblemSort {
  const value = parseStringParam(sort);

  return value === "oldest" || value === "title" || value === "platform"
    ? value
    : "newest";
}

function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}
