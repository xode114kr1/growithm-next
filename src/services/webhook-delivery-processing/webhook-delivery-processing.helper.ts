import { ProblemPlatform } from "@/generated/prisma/client";
import {
  type GitHubContentResponse,
  type ParsedProblemReadme,
  validateParsedProblemReadme,
} from "@/services/webhook-delivery-processing/webhook-delivery-processing.validator";
import type { GitHubReadmeChange, GitHubWebhookPayload } from "@/types/github";

type GitHubPushCommit = {
  added?: unknown;
  id?: unknown;
  modified?: unknown;
};

// 커밋과 파일 경로를 사용해 GitHub 원본 파일 URL을 만든다.
export function buildRawGitHubContentUrl({
  commitSha,
  path,
  repositoryFullName,
}: {
  commitSha: string;
  path: string;
  repositoryFullName: string;
}) {
  return `https://raw.githubusercontent.com/${repositoryFullName}/${commitSha}/${encodeGitHubPath(path)}`;
}

// GitHub API 요청에 사용할 파일 경로의 각 구간을 인코딩한다.
export function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

// GitHub README 조회 실패 응답을 오류 메시지로 변환한다.
export function getGitHubContentErrorMessage(
  status: number,
  data: GitHubContentResponse | null,
) {
  if (typeof data?.message === "string" && data.message) {
    return `GitHub README 조회 실패: ${data.message}`;
  }

  return `GitHub README 조회 실패: HTTP ${status}`;
}

// 플랫폼 형식을 판별해 README의 문제 정보를 파싱한다.
export function parseProblemReadme(text: string) {
  if (text.includes("https://www.acmicpc.net/problem/")) {
    return validateParsedProblemReadme(parseBaekjoonReadme(text));
  }

  if (text.includes("https://school.programmers.co.kr/")) {
    return validateParsedProblemReadme(parseProgrammersReadme(text));
  }

  return null;
}

// GitHub 웹훅 payload에서 저장소 소유자 ID를 추출한다.
export function getRepositoryOwnerId(payload: GitHubWebhookPayload) {
  const ownerId = payload.repository?.owner?.id;

  if (typeof ownerId === "number") {
    return ownerId.toString();
  }

  return typeof ownerId === "string" && ownerId ? ownerId : null;
}

// GitHub push payload에서 처리할 문제의 README와 풀이 코드 경로를 추출한다.
export function getProblemFileChangeFromPushPayload(
  payload: GitHubWebhookPayload,
): GitHubReadmeChange | null {
  if (!Array.isArray(payload.commits)) {
    return null;
  }

  const commitSha =
    getAfterCommitSha(payload) ??
    getCommitSha(payload.commits[payload.commits.length - 1]);
  const readmePaths = payload.commits.flatMap(getReadmePathsFromCommit);
  const codePaths = payload.commits.flatMap(getCodePathsFromCommit);
  const readmePath = readmePaths.at(-1);

  if (!commitSha || !readmePath) {
    return null;
  }

  return {
    codePath: findCodePathForReadme(readmePath, codePaths),
    commitSha,
    path: readmePath,
  };
}

// GitHub push payload에서 최종 커밋 SHA를 추출한다.
function getAfterCommitSha(payload: GitHubWebhookPayload) {
  return typeof payload.after === "string" && payload.after ? payload.after : null;
}

// GitHub 커밋에서 추가되거나 수정된 README 경로를 추출한다.
function getReadmePathsFromCommit(commit: unknown) {
  if (!isPushCommit(commit)) {
    return [];
  }

  return [...getStringArray(commit.added), ...getStringArray(commit.modified)]
    .map((path) => path.trim())
    .filter(isReadmePath);
}

// GitHub 커밋에서 추가되거나 수정된 풀이 코드 경로를 추출한다.
function getCodePathsFromCommit(commit: unknown) {
  if (!isPushCommit(commit)) {
    return [];
  }

  return [...getStringArray(commit.added), ...getStringArray(commit.modified)]
    .map((path) => path.trim())
    .filter(isCodePath);
}

// GitHub push 커밋 객체에서 커밋 SHA를 추출한다.
function getCommitSha(commit: unknown) {
  if (!isPushCommit(commit)) {
    return null;
  }

  return typeof commit.id === "string" && commit.id ? commit.id : null;
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

// 경로가 README 파일을 가리키는지 확인한다.
function isReadmePath(path: string) {
  return /(^|\/)README\.md$/i.test(path);
}

// 경로가 처리 가능한 풀이 코드 파일인지 확인한다.
function isCodePath(path: string) {
  return path !== "" && !isReadmePath(path) && !path.toLowerCase().endsWith(".md");
}

// README와 같은 디렉터리에 변경된 풀이 코드 경로를 찾는다.
function findCodePathForReadme(readmePath: string, codePaths: string[]) {
  const readmeDirectory = getDirectoryPath(readmePath);

  return (
    codePaths.find((codePath) => getDirectoryPath(codePath) === readmeDirectory) ??
    null
  );
}

// 파일 경로에서 상위 디렉터리 경로를 추출한다.
function getDirectoryPath(path: string) {
  const lastSlashIndex = path.lastIndexOf("/");

  return lastSlashIndex === -1 ? "" : path.slice(0, lastSlashIndex);
}

type ProblemReadmeDraft = Partial<ParsedProblemReadme> & {
  platform: ProblemPlatform;
};

// 백준 README에서 문제 제출 정보를 추출한다.
function parseBaekjoonReadme(text: string): ProblemReadmeDraft {
  const result: ProblemReadmeDraft = {
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

// 프로그래머스 README에서 문제 제출 정보를 추출한다.
function parseProgrammersReadme(text: string): ProblemReadmeDraft {
  const result: ProblemReadmeDraft = {
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
