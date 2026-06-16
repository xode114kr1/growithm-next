import { getUserStudies } from "@/services/studies/study.query";
import StudyList from "./study-list";
import StudyListHeader from "./study-list-header";

export default async function StudyListSection({
  userId,
}: {
  userId: string | undefined;
}) {
  const studies = await getUserStudies(userId);
  return (
    <section className="space-y-gutter xl:col-span-8">
      <StudyListHeader />
      <StudyList studies={studies} userId={userId} />
    </section>
  );
}
