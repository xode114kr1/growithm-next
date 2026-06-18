import type { StudyMember } from "@/types/study";

export type StudyMemberRoleFilter = "ALL" | StudyMember["role"];
export type StudyMemberSort =
  | "contribution"
  | "lastActive"
  | "joinedAt"
  | "name";

export type StudyMemberFiltersState = {
  q: string;
  role: StudyMemberRoleFilter;
  sort: StudyMemberSort;
};

export type StudyMembersPageSearchParams = {
  q?: string | string[];
  role?: string | string[];
  sort?: string | string[];
};
