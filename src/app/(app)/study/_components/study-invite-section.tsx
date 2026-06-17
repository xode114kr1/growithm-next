import { getPendingInvites } from "@/services/studies/study.query";
import StudyInvites from "./study-invites";

export default async function StudyInviteSection({
  userId,
}: {
  userId: string | undefined;
}) {
  const invites = await getPendingInvites(userId);
  return (
    <aside className="space-y-gutter xl:sticky xl:top-28 xl:col-span-4 xl:self-start">
      <StudyInvites invites={invites} />
    </aside>
  );
}
