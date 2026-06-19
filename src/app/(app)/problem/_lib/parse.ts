import { ProblemPlatform } from "@/generated/prisma/enums";
import {
  ProblemFiltersState,
  ProblemPageSearchParams,
  ProblemSort,
} from "@/types/problem";

export function parseFilters(
  params: ProblemPageSearchParams,
): ProblemFiltersState {
  return {
    platform: parsePlatformParam(params.platform),
    q: parseStringParam(params.q),
    sort: parseSortParam(params.sort),
    tier: parseStringParam(params.tier),
  };
}

export function parsePageParam(page: string | string[] | undefined) {
  const parsedPage = Number(parseStringParam(page));

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

export function parsePlatformParam(platform: string | string[] | undefined) {
  const value = parseStringParam(platform);

  return value === ProblemPlatform.BAEKJOON ||
    value === ProblemPlatform.PROGRAMMERS
    ? value
    : null;
}

export function parseSortParam(
  sort: string | string[] | undefined,
): ProblemSort {
  const value = parseStringParam(sort);

  return value === "oldest" || value === "title" || value === "platform"
    ? value
    : "newest";
}

export function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}

export function buildQueryString(params: ProblemPageSearchParams) {
  const query = new URLSearchParams();

  for (const key of ["platform", "tier", "q", "sort"] as const) {
    const value = parseStringParam(params[key]);

    if (value) {
      query.set(key, value);
    }
  }

  return query.toString();
}
