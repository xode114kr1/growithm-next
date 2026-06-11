import "server-only";

import { prisma } from "@/lib/prisma";
import type { StudyLayoutData } from "@/types/study";

// 스터디 상세 레이아웃에 필요한 접근 권한과 기본 정보를 조회한다.
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
