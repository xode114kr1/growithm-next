import { redirect } from "next/navigation";

export default async function StudyDetailPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;

  redirect(`/study/${studyId}/overview`);
}
