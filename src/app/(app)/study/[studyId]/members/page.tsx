import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyMembers } from "@/services/studies/study.query";

import StudyMemberFilters from "./_components/study-member-filters";
import StudyMemberList from "./_components/study-member-list";
import { parseStudyMemberFilters } from "./_lib/parse";
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

  const filters = parseStudyMemberFilters(urlSearchParams);
  const members = await getStudyMembers({ filters, studyId, userId });

  if (!members) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <StudyMemberFilters filters={filters} />
      <StudyMemberList members={members} />
    </section>
  );
}
