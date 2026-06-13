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

// GitHub API 요청에 사용할 파일 경로의 각 구간을 인코딩한다.
function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}
