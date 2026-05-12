import Link from "next/link";
import { notFound } from "next/navigation";

import StudyMemberList, {
  type StudyMember,
} from "@/app/(app)/study/[studyId]/members/_components/study-member-list";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

type StudyMembersData = {
  description: string;
  memberCount: number;
  members: StudyMember[];
  name: string;
};

export default async function StudyMembersPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  const data = await getStudyMembersData(studyId);

  if (!data) {
    notFound();
  }

  return (
    <>
      <StudyMembersHeading
        memberCount={data.memberCount}
        studyDescription={data.description}
        studyName={data.name}
      />
      <StudyMemberList members={data.members} />
    </>
  );
}

async function getStudyMembersData(
  studyId: string,
): Promise<StudyMembersData | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const study = await prisma.study.findFirst({
    include: {
      members: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      problemShares: {
        select: {
          score: true,
          sharedAt: true,
          userId: true,
        },
      },
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
    description:
      study.description ?? "스터디 멤버의 기여도와 최근 활동 상태를 확인합니다.",
    memberCount: study.members.length,
    members: study.members.map((member) => {
      const shares = study.problemShares.filter(
        (share) => share.userId === member.userId,
      );
      const lastSharedAt = shares.reduce<Date | null>(
        (latestSharedAt, share) =>
          !latestSharedAt || share.sharedAt > latestSharedAt
            ? share.sharedAt
            : latestSharedAt,
        null,
      );

      return {
        contribution: shares.reduce((total, share) => total + share.score, 0),
        lastActive: formatDate(lastSharedAt ?? member.joinedAt),
        name: getUserDisplayName(member.user.name),
        role: member.role,
      };
    }),
    name: study.title,
  };
}

function StudyMembersHeading({
  memberCount,
  studyDescription,
  studyName,
}: {
  memberCount: number;
  studyDescription: string;
  studyName: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
          <Link className="font-semibold transition-colors hover:text-primary" href="/study">
            Studies
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">{studyName}</span>
          <span>/</span>
          <span>스터디 - 멤버</span>
        </div>
        <h1 className="page-title mb-2">
          Study Members
        </h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          {studyDescription}
        </p>
      </div>
      <div className="app-card px-5 py-3">
        <p className="text-label-caps text-slate-400">Members</p>
        <p className="text-h3-ui text-primary">{memberCount}명</p>
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getUserDisplayName(name: string | null) {
  return name || "Unknown";
}
