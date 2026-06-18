import type { StudyMember } from "@/types/study";

import { studyMemberRoleLabels } from "../constants";
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

export function filterAndSortStudyMembers(
  members: StudyMember[],
  filters: StudyMemberFiltersState,
) {
  const normalizedQuery = filters.q.toLowerCase();

  return members
    .filter((member) => {
      if (filters.role !== "ALL" && member.role !== filters.role) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        member.name,
        studyMemberRoleLabels[member.role],
        member.role,
        member.lastActive,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .toSorted((firstMember, secondMember) => {
      if (filters.sort === "name") {
        return firstMember.name.localeCompare(secondMember.name);
      }

      if (filters.sort === "lastActive") {
        return secondMember.lastActiveTime - firstMember.lastActiveTime;
      }

      if (filters.sort === "joinedAt") {
        return firstMember.joinedAtTime - secondMember.joinedAtTime;
      }

      return secondMember.contribution - firstMember.contribution;
    });
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
