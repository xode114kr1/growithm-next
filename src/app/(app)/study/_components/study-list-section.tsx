import { getUserStudies } from "@/services/studies/study.query";
import StudyList from "./study-list";

export default async function StudyListSection({
  userId,
}: {
  userId: string | undefined;
}) {
  const studies = await getUserStudies(userId);
  return (
    <section className="space-y-gutter xl:col-span-8">
      <StudyList studies={studies} userId={userId} />
    </section>
  );
}
