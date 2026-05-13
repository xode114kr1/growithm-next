import { prisma } from "@/lib/prisma";
import type { StudyLayoutData } from "@/features/study/types";

export async function getStudyLayoutData({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyLayoutData | null> {
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
