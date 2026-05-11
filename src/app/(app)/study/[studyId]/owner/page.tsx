import Link from "next/link";
import { notFound } from "next/navigation";

import StudyLocalNav from "@/app/(app)/study/[studyId]/_components/study-local-nav";
import OwnerConsole from "@/app/(app)/study/[studyId]/owner/_components/owner-console";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

type OwnerStudy = {
  description: string;
  id: string;
  name: string;
};

type OwnerMember = {
  contribution: number;
  isCurrentUser: boolean;
  joinedAt: string;
  lastActive: string;
  name: string;
  role: "OWNER" | "LEADER" | "MEMBER";
};

export default async function StudyOwnerPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  const ownerData = await getStudyOwnerData(studyId);

  if (!ownerData) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="workspace-container">
        <StudyLocalNav
          active="owner"
          showOwner
          studyId={studyId}
          studyName={ownerData.study.name}
        />
        <div className="min-w-0 flex-1">
          <StudyOwnerHeading study={ownerData.study} />
          <OwnerConsole
            initialInvites={ownerData.pendingInvites}
            members={ownerData.members}
            study={ownerData.study}
          />
        </div>
      </div>
    </main>
  );
}

async function getStudyOwnerData(studyId: string): Promise<{
  members: OwnerMember[];
  pendingInvites: Array<{ id: string; status: "Pending"; target: string }>;
  study: OwnerStudy;
} | null> {
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
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      problemShares: {
        select: {
          score: true,
          sharedAt: true,
          userId: true,
        },
      },
      invites: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          target: true,
        },
        where: {
          status: "PENDING",
        },
      },
    },
    where: {
      id: studyId,
      ownerId: userId,
    },
  });

  if (!study) {
    return null;
  }

  const members = study.members.map((member): OwnerMember => {
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
      isCurrentUser: member.userId === userId,
      joinedAt: formatDate(member.joinedAt),
      lastActive: formatDate(lastSharedAt ?? member.joinedAt),
      name: getUserDisplayName(member.user.name),
      role: member.userId === study.ownerId ? "OWNER" : "MEMBER",
    };
  });

  if (!members.some((member) => member.role === "OWNER")) {
    members.unshift({
      contribution: study.problemShares
        .filter((share) => share.userId === study.ownerId)
        .reduce((total, share) => total + share.score, 0),
      isCurrentUser: study.ownerId === userId,
      joinedAt: formatDate(study.createdAt),
      lastActive: formatDate(study.createdAt),
      name: getUserDisplayName(study.owner.name),
      role: "OWNER",
    });
  }

  return {
    members,
    pendingInvites: study.invites.map((invite) => ({
      id: invite.id,
      status: "Pending",
      target: invite.target,
    })),
    study: {
      description: study.description ?? "아직 스터디 설명이 없습니다.",
      id: study.id,
      name: study.title,
    },
  };
}

function StudyOwnerHeading({ study }: { study: OwnerStudy }) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
        <Link className="font-semibold transition-colors hover:text-primary" href="/study">
          Studies
        </Link>
        <span>/</span>
        <span className="font-semibold text-primary">{study.name}</span>
        <span>/</span>
        <span>스터디 - Owner</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="page-title">
          Study Owner Console
        </h1>
        <span className="w-fit rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary">
          Owner Only
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
        멤버 초대, 멤버 권한, 스터디 설정과 삭제를 관리합니다.
      </p>
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
