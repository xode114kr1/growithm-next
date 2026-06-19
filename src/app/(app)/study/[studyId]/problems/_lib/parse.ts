import { ProblemPlatform } from "@/generated/prisma/enums";

import type {
  StudyProblemFilters,
  StudyProblemPageSearchParams,
  StudyProblemSort,
} from "../types";

export function parseStudyProblemFilters(
  params: StudyProblemPageSearchParams,
): StudyProblemFilters {
  const member = parseStringParam(params.member);
  const tier = parseStringParam(params.tier);

  return {
    member: member || null,
    platform: parsePlatformParam(params.platform),
    sort: parseSortParam(params.sort),
    tier: tier || null,
  };
}

export function parseStudyProblemPage(
  page: string | string[] | undefined,
) {
  const parsedPage = Number(parseStringParam(page));

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

export function buildStudyProblemQueryString(filters: StudyProblemFilters) {
  const query = new URLSearchParams();

  if (filters.platform) {
    query.set("platform", filters.platform);
  }

  if (filters.tier) {
    query.set("tier", filters.tier);
  }

  if (filters.member) {
    query.set("member", filters.member);
  }

  if (filters.sort !== "latest") {
    query.set("sort", filters.sort);
  }

  return query.toString();
}

function parsePlatformParam(
  platform: string | string[] | undefined,
): ProblemPlatform | null {
  const value = parseStringParam(platform);

  return value === ProblemPlatform.BAEKJOON ||
    value === ProblemPlatform.PROGRAMMERS
    ? value
    : null;
}

function parseSortParam(
  sort: string | string[] | undefined,
): StudyProblemSort {
  const value = parseStringParam(sort);

  return value === "oldest" ||
    value === "title" ||
    value === "tier" ||
    value === "member"
    ? value
    : "latest";
}

function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}
