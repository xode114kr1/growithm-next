import "server-only";

import type {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";

export type ParsedProblemMetadata = {
  accuracy?: number;
  categories?: string[];
  description?: string;
  link?: string;
  memory?: string;
  platform: ProblemPlatform;
  problemId: string;
  score?: number;
  scoreMax?: number;
  submittedAtText?: string;
  tier?: string;
  time?: string;
  title: string;
};

export type CreateProblemSubmissionInput = {
  code: string | null;
  commitSha: string;
  metadataPath: string;
  parsedMetadata: ParsedProblemMetadata;
  repositoryFullName: string;
  score: number;
  userId: string;
};

export type ProblemSubmissionInput = {
  accuracy?: number;
  categories?: string[];
  code: string | null;
  commitSha: string;
  description?: string;
  link?: string;
  memory?: string;
  platform: ProblemPlatform;
  problemId: string;
  metadataPath: string;
  repositoryFullName: string;
  score: number;
  scoreMax?: number;
  status: ProblemSubmissionStatus;
  submittedAtText?: string;
  tier?: string;
  time?: string;
  title: string;
  userId: string;
};
