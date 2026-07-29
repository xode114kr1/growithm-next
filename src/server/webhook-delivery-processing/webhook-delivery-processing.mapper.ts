import "server-only";

import {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";
import { validateParsedProblemMetadata } from "@/server/webhook-delivery-processing/webhook-delivery-processing.schema";
import type {
  CreateProblemSubmissionInput,
  ParsedProblemMetadata,
  ProblemSubmissionInput,
} from "@/server/webhook-delivery-processing/webhook-delivery-processing.types";
import type {
  GitHubProblemFileChange,
  GitHubWebhookPayload,
} from "@/types/github";

type GitHubPushCommit = {
  added?: unknown;
  modified?: unknown;
};

// 플랫폼 형식을 판별해 문제 정보를 파싱한다.
export function parseProblemMetadata(text: string) {
  if (text.includes("https://www.acmicpc.net/problem/")) {
    return validateParsedProblemMetadata(parseBaekjoonMetadata(text));
  }

  if (text.includes("https://school.programmers.co.kr/")) {
    return validateParsedProblemMetadata(parseProgrammersMetadata(text));
  }

  return null;
}

// 파싱한 문제 정보를 문제 제출 저장 데이터로 변환한다.
export function createProblemSubmission({
  code,
  commitSha,
  metadataPath,
  parsedMetadata,
  repositoryFullName,
  score,
  userId,
}: CreateProblemSubmissionInput): ProblemSubmissionInput {
  return {
    accuracy: parsedMetadata.accuracy,
    categories: parsedMetadata.categories,
    code,
    commitSha,
    description: parsedMetadata.description,
    link: parsedMetadata.link,
    memory: parsedMetadata.memory,
    metadataPath,
    platform: parsedMetadata.platform,
    problemId: parsedMetadata.problemId,
    repositoryFullName,
    score,
    scoreMax: parsedMetadata.scoreMax,
    status: ProblemSubmissionStatus.PENDING,
    submittedAtText: parsedMetadata.submittedAtText,
    tier: parsedMetadata.tier,
    time: parsedMetadata.time,
    title: parsedMetadata.title,
    userId,
  };
}

// GitHub 웹훅 payload에서 저장소 소유자 ID를 추출한다.
export function getRepositoryOwnerId(payload: GitHubWebhookPayload) {
  const ownerId = payload.repository?.owner?.id;

  if (typeof ownerId === "number") {
    return ownerId.toString();
  }

  return typeof ownerId === "string" && ownerId ? ownerId : null;
}

// GitHub push payload에서 처리할 문제 정보와 풀이 코드 경로를 추출한다.
export function getProblemFileChangeFromPushPayload(
  payload: GitHubWebhookPayload,
): GitHubProblemFileChange | null {
  if (!Array.isArray(payload.commits)) {
    return null;
  }

  const commitSha = getAfterCommitSha(payload);
  const commit = payload.commits[0];
  const changedPaths = getChangedPathsFromCommit(commit);
  const metadataPath = changedPaths.find(isProblemMetadataPath) ?? null;
  const codePath = changedPaths.find(isCodePath) ?? null;

  if (!commitSha || !metadataPath) {
    return null;
  }

  return {
    codePath,
    commitSha,
    metadataPath,
  };
}

// GitHub push payload에서 최종 커밋 SHA를 추출한다.
function getAfterCommitSha(payload: GitHubWebhookPayload) {
  return typeof payload.after === "string" && payload.after
    ? payload.after
    : null;
}

// GitHub 커밋에서 추가되거나 수정된 파일 경로를 추출한다.
function getChangedPathsFromCommit(commit: unknown) {
  if (!isPushCommit(commit)) {
    return [];
  }

  return [
    ...getStringArray(commit.added),
    ...getStringArray(commit.modified),
  ].map((path) => path.trim());
}

// 값이 GitHub push 커밋 객체인지 확인한다.
function isPushCommit(value: unknown): value is GitHubPushCommit {
  return typeof value === "object" && value !== null;
}

// 알 수 없는 값을 문자열 배열로 안전하게 변환한다.
function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

// 경로가 문제 정보 파일을 가리키는지 확인한다.
function isProblemMetadataPath(path: string) {
  return /(^|\/)README\.md$/i.test(path);
}

// 경로가 처리 가능한 풀이 코드 파일인지 확인한다.
function isCodePath(path: string) {
  return (
    path !== "" &&
    !isProblemMetadataPath(path) &&
    !path.toLowerCase().endsWith(".md")
  );
}

type ProblemMetadataDraft = Partial<ParsedProblemMetadata> & {
  platform: ProblemPlatform;
};

// 백준 문제 정보 파일에서 문제 제출 정보를 추출한다.
function parseBaekjoonMetadata(text: string): ProblemMetadataDraft {
  const result: ProblemMetadataDraft = {
    platform: ProblemPlatform.BAEKJOON,
  };

  const titleMatch = text.match(/^# \[(.+?)\] (.+?) - (\d+)/m);
  if (titleMatch) {
    result.tier = titleMatch[1];
    result.title = titleMatch[2];
    result.problemId = titleMatch[3];
  }

  const linkMatch = text.match(/\(https:\/\/www\.acmicpc\.net\/problem\/\d+\)/);
  if (linkMatch) result.link = linkMatch[0].slice(1, -1);

  const memoryMatch = text.match(/메모리:\s*([\d]+ KB)/);
  const timeMatch = text.match(/시간:\s*([\d]+ ms)/);
  if (memoryMatch) result.memory = memoryMatch[1];
  if (timeMatch) result.time = timeMatch[1];

  const categoryMatch = text.match(/### 분류\s+([\s\S]+?)\n\n/);
  if (categoryMatch) result.categories = categoryMatch[1].trim().split(/,\s*/);

  const dateMatch = text.match(/### 제출 일자\s+(.+)/);
  if (dateMatch) result.submittedAtText = dateMatch[1].trim();

  const descMatch = text.match(/### 문제 설명\s+([\s\S]+)/);
  if (descMatch) result.description = descMatch[1].trim();

  return result;
}

// 프로그래머스 문제 정보 파일에서 문제 제출 정보를 추출한다.
function parseProgrammersMetadata(text: string): ProblemMetadataDraft {
  const result: ProblemMetadataDraft = {
    platform: ProblemPlatform.PROGRAMMERS,
  };

  const titleMatch = text.match(/^# \[(.+?)\] (.+?) - (\d+)/m);
  if (titleMatch) {
    result.tier = titleMatch[1];
    result.title = titleMatch[2];
    result.problemId = titleMatch[3];
  }

  const linkMatch = text.match(
    /\(https:\/\/school\.programmers\.co\.kr\/[^)]+\)/,
  );
  if (linkMatch) result.link = linkMatch[0].slice(1, -1);

  const memoryMatch = text.match(/메모리:\s*([\d.]+ MB)/);
  const timeMatch = text.match(/시간:\s*([\d.]+ ms)/);
  if (memoryMatch) result.memory = memoryMatch[1];
  if (timeMatch) result.time = timeMatch[1];

  const categoryMatch = text.match(/### 구분\s+(.+)\n/);
  if (categoryMatch) {
    result.categories = categoryMatch[1]
      .replace(/\s+/g, " ")
      .trim()
      .split(">")
      .map((item) => item.trim());
  }

  const accuracyMatch = text.match(/정확성:\s*([\d.]+)%/);
  if (accuracyMatch) result.accuracy = Number.parseFloat(accuracyMatch[1]);

  const scoreMatch = text.match(/합계:\s*([\d.]+)\s*\/\s*([\d.]+)/);
  if (scoreMatch) {
    result.score = Number.parseFloat(scoreMatch[1]);
    result.scoreMax = Number.parseFloat(scoreMatch[2]);
  }

  const dateMatch = text.match(/### 제출 일자\s+(.+)/);
  if (dateMatch) result.submittedAtText = dateMatch[1].trim();

  const descMatch = text.match(/### 문제 설명\s+([\s\S]+)/);
  if (descMatch) {
    const rawDescription = descMatch[1];
    const sourceIndex = rawDescription.indexOf("\n\n> 출처");
    result.description =
      sourceIndex === -1
        ? rawDescription.trim()
        : rawDescription.slice(0, sourceIndex).trim();
  }

  return result;
}
