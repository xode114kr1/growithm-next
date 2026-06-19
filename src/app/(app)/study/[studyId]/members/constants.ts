import type { StudyMember } from "@/types/study";

export const studyMemberRoleLabels: Record<StudyMember["role"], string> = {
  LEADER: "리더",
  MEMBER: "멤버",
  OWNER: "owner",
};
