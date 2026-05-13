"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { validateStudyInput } from "@/features/study/validation/study-input";

export type CreateStudyActionState = {
  description: string;
  error: string | null;
  status: "idle" | "error" | "success";
  studyId: string | null;
  title: string;
};

export async function createStudy(
  _prevState: CreateStudyActionState,
  formData: FormData,
): Promise<CreateStudyActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  const title = getFormValue(formData, "title").trim();
  const description = getFormValue(formData, "description").trim();

  if (!userId) {
    return createErrorState({
      description,
      error: "로그인이 필요합니다.",
      title,
    });
  }

  const validationError = validateStudyInput({ description, title });

  if (validationError) {
    return createErrorState({
      description,
      error: validationError,
      title,
    });
  }

  try {
    const study = await prisma.study.create({
      data: {
        description: description || null,
        members: {
          create: {
            role: "OWNER",
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
        owner: {
          connect: {
            id: userId,
          },
        },
        title,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/study");

    return {
      description,
      error: null,
      status: "success",
      studyId: study.id,
      title,
    };
  } catch (error) {
    console.error("Failed to create study", error);

    return createErrorState({
      description,
      error: "스터디를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.",
      title,
    });
  }
}

export async function acceptStudyInvite(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const inviteId = getFormValue(formData, "inviteId");

  if (!userId || !inviteId) {
    return;
  }

  const invite = await prisma.studyInvite.findFirst({
    select: {
      id: true,
      studyId: true,
    },
    where: {
      expiresAt: {
        gt: new Date(),
      },
      id: inviteId,
      status: "PENDING",
      targetUserId: userId,
    },
  });

  if (!invite) {
    return;
  }

  await prisma.$transaction([
    prisma.studyMember.upsert({
      create: {
        studyId: invite.studyId,
        userId,
      },
      update: {},
      where: {
        studyId_userId: {
          studyId: invite.studyId,
          userId,
        },
      },
    }),
    prisma.studyInvite.update({
      data: {
        status: "ACCEPTED",
      },
      where: {
        id: invite.id,
      },
    }),
  ]);

  revalidatePath("/study");
  revalidatePath(`/study/${invite.studyId}/overview`);
}

export async function declineStudyInvite(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const inviteId = getFormValue(formData, "inviteId");

  if (!userId || !inviteId) {
    return;
  }

  await prisma.studyInvite.updateMany({
    data: {
      status: "CANCELED",
    },
    where: {
      id: inviteId,
      status: "PENDING",
      targetUserId: userId,
    },
  });

  revalidatePath("/study");
}

function createErrorState({
  description,
  error,
  title,
}: {
  description: string;
  error: string;
  title: string;
}): CreateStudyActionState {
  return {
    description,
    error,
    status: "error",
    studyId: null,
    title,
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
