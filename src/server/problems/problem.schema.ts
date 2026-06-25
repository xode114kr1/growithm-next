import "server-only";

import { ProblemPlatform } from "@/generated/prisma/enums";
import type {
  ProblemFiltersState,
  ProblemPageSearchParams,
  ProblemSort,
} from "@/types/problem";

export function parseProblemFilters(
  params: ProblemPageSearchParams,
): ProblemFiltersState {
  return {
    platform: parseProblemPlatform(params.platform),
    q: parseStringParam(params.q),
    sort: parseProblemSort(params.sort),
    tier: parseStringParam(params.tier),
  };
}

export function parseProblemPage(page: string | string[] | undefined) {
  const parsedPage = Number(parseStringParam(page));

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function parseProblemPlatform(platform: string | string[] | undefined) {
  const value = parseStringParam(platform);

  return value === ProblemPlatform.BAEKJOON ||
    value === ProblemPlatform.PROGRAMMERS
    ? value
    : null;
}

function parseProblemSort(
  sort: string | string[] | undefined,
): ProblemSort {
  const value = parseStringParam(sort);

  return value === "oldest" || value === "title" || value === "platform"
    ? value
    : "newest";
}

function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}
