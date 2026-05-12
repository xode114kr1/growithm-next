import { notFound } from "next/navigation";

import StudyLocalNav from "@/app/(app)/study/[studyId]/_components/study-local-nav";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

type StudyDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ studyId: string }>;
};

export default async function StudyDetailLayout({
  children,
  params,
}: StudyDetailLayoutProps) {
  const { studyId } = await params;
  const study = await getStudyLayoutData(studyId);

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

async function getStudyLayoutData(studyId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const study = await prisma.study.findFirst({
    select: {
      id: true,
      ownerId: true,
      title: true,
    },
    where: {
      id: studyId,
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  });

  if (!study) {
    return null;
  }

  return {
    id: study.id,
    isOwner: study.ownerId === userId,
    name: study.title,
  };
}
