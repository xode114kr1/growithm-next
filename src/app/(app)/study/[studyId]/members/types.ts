import type { StudyMemberFilters } from "@/types/study";

export type {
  StudyMemberRoleFilter,
  StudyMemberSort,
} from "@/types/study";

export type StudyMemberFiltersState = StudyMemberFilters;

export type StudyMembersPageSearchParams = {
  q?: string | string[];
  role?: string | string[];
  sort?: string | string[];
};
