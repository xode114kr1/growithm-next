import type {
  StudyMemberFiltersState,
  StudyMemberRoleFilter,
  StudyMembersPageSearchParams,
  StudyMemberSort,
} from "../types";

export function parseStudyMemberFilters(
  params: StudyMembersPageSearchParams,
): StudyMemberFiltersState {
  return {
    q: parseStringParam(params.q),
    role: parseRoleParam(params.role),
    sort: parseSortParam(params.sort),
  };
}

function parseRoleParam(
  role: string | string[] | undefined,
): StudyMemberRoleFilter {
  const value = parseStringParam(role);

  return value === "OWNER" || value === "LEADER" || value === "MEMBER"
    ? value
    : "ALL";
}

function parseSortParam(sort: string | string[] | undefined): StudyMemberSort {
  const value = parseStringParam(sort);

  return value === "lastActive" || value === "joinedAt" || value === "name"
    ? value
    : "contribution";
}

function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}
