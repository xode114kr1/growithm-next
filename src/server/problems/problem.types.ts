import "server-only";

import type { ProblemPlatform } from "@/generated/prisma/enums";
import type {
  ProblemDetail,
  ProblemListItem,
} from "@/types/problem";

export type ProblemListItemRow = {
  categories: unknown;
  createdAt: Date;
  id: string;
  platform: ProblemPlatform;
  problemId: string;
  status: ProblemListItem["status"];
  submittedAtText: string | null;
  tier: string | null;
  title: string;
};

export type ProblemDetailRow = Omit<ProblemDetail, "categories"> & {
  categories: unknown;
};

export type PendingProblemRow = {
  id: string;
  platform: ProblemPlatform;
  problemId: string;
  submittedAtText: string | null;
  tier: string | null;
  title: string;
};

export type ProblemTierRow = {
  tier: string | null;
};

export type ProblemListPage = {
  hasNextPage: boolean;
  items: ProblemListItem[];
  nextCursor: string | null;
};
