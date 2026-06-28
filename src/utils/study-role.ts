import type { StudyMember, StudyOverviewMember } from "@/types/study";

export const studyMemberRoleLabels = {
  LEADER: "Leader",
  MEMBER: "Member",
  OWNER: "Owner",
} satisfies Record<StudyMember["role"], string>;

export const studyOverviewMemberRoleLabels = {
  member: "Member",
  owner: "Owner",
} satisfies Record<StudyOverviewMember["role"], string>;
