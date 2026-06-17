import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getStudyLayoutData } from "@/services/studies/study.query";

import StudyLocalNav from "./_components/study-local-nav";

type StudyDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ studyId: string }>;
};

export default async function StudyDetailLayout({
  children,
  params,
}: StudyDetailLayoutProps) {
  const { studyId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const study = await getStudyLayoutData({ studyId, userId });

  if (!study) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="workspace-container">
        <StudyLocalNav
          showOwner={study.isOwner}
          studyId={study.id}
          studyName={study.name}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
