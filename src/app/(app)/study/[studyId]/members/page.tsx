import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyMembers } from "@/services/studies/study.query";

import StudyMemberFilters from "./_components/study-member-filters";
import StudyMemberList from "./_components/study-member-list";
import { filterAndSortStudyMembers, parseStudyMemberFilters } from "./_lib/parse";
import type { StudyMembersPageSearchParams } from "./types";

export default async function StudyMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ studyId: string }>;
  searchParams: Promise<StudyMembersPageSearchParams>;
}) {
  const [{ studyId }, urlSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const members = await getStudyMembers({ studyId, userId });

  if (!members) {
    notFound();
  }

  const filters = parseStudyMemberFilters(urlSearchParams);
  const filteredMembers = filterAndSortStudyMembers(members, filters);

  return (
    <section className="space-y-5">
      <StudyMemberFilters filters={filters} />
      <StudyMemberList members={filteredMembers} />
    </section>
  );
}
