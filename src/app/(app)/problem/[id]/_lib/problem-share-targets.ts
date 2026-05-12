import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export type ProblemShareTargetStudy = {
  id: string;
  memberCount: number;
  ownerName: string;
  score: number;
  title: string;
};

export async function getProblemShareTargetStudies(): Promise<
  ProblemShareTargetStudy[]
> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return [];
  }

  const studies = await prisma.study.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      _count: {
        select: {
          members: true,
        },
      },
      id: true,
      owner: {
        select: {
          name: true,
        },
      },
      score: true,
      title: true,
    },
    where: {
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

  return studies.map((study) => ({
    id: study.id,
    memberCount: study._count.members,
    ownerName: study.owner.name ?? "Unknown",
    score: study.score,
    title: study.title,
  }));
}
