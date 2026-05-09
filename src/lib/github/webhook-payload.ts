export type GitHubWebhookPayload = {
  after?: unknown;
  commits?: unknown;
  repository?: {
    full_name?: unknown;
    owner?: {
      id?: unknown;
    };
  };
};

export type GitHubReadmeChange = {
  codePath: string | null;
  commitSha: string;
  path: string;
};

type GitHubPushCommit = {
  added?: unknown;
  id?: unknown;
  modified?: unknown;
};

export function getRepositoryFullName(payload: GitHubWebhookPayload) {
  return typeof payload.repository?.full_name === "string"
    ? payload.repository.full_name
    : null;
}

export function getAfterCommitSha(payload: GitHubWebhookPayload) {
  return typeof payload.after === "string" && payload.after ? payload.after : null;
}

export function getRepositoryOwnerId(payload: GitHubWebhookPayload) {
  const ownerId = payload.repository?.owner?.id;

  if (typeof ownerId === "number") {
    return ownerId.toString();
  }

  return typeof ownerId === "string" && ownerId ? ownerId : null;
}

export function getReadmeChangesFromPushPayload(
  payload: GitHubWebhookPayload,
): GitHubReadmeChange[] {
  if (!Array.isArray(payload.commits)) {
    return [];
  }

  const changes = new Map<string, GitHubReadmeChange>();

  for (const commit of payload.commits) {
    const readmePaths = getReadmePathsFromCommit(commit);
    const codePaths = getCodePathsFromCommit(commit);
    const commitSha = getCommitSha(commit);

    if (!commitSha) {
      continue;
    }

    for (const path of readmePaths) {
      changes.set(`${commitSha}:${path}`, {
        codePath: findCodePathForReadme(path, codePaths),
        commitSha,
        path,
      });
    }
  }

  return [...changes.values()];
}

function getReadmePathsFromCommit(commit: unknown) {
  if (!isPushCommit(commit)) {
    return [];
  }

  return [...getStringArray(commit.added), ...getStringArray(commit.modified)]
    .map((path) => path.trim())
    .filter(isReadmePath);
}

function getCodePathsFromCommit(commit: unknown) {
  if (!isPushCommit(commit)) {
    return [];
  }

  return [...getStringArray(commit.added), ...getStringArray(commit.modified)]
    .map((path) => path.trim())
    .filter(isCodePath);
}

function getCommitSha(commit: unknown) {
  if (!isPushCommit(commit)) {
    return null;
  }

  return typeof commit.id === "string" && commit.id ? commit.id : null;
}

function isPushCommit(value: unknown): value is GitHubPushCommit {
  return typeof value === "object" && value !== null;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isReadmePath(path: string) {
  return /(^|\/)README\.md$/i.test(path);
}

function isCodePath(path: string) {
  return path !== "" && !isReadmePath(path) && !path.toLowerCase().endsWith(".md");
}

function findCodePathForReadme(readmePath: string, codePaths: string[]) {
  const readmeDirectory = getDirectoryPath(readmePath);

  return (
    codePaths.find((codePath) => getDirectoryPath(codePath) === readmeDirectory) ??
    null
  );
}

function getDirectoryPath(path: string) {
  const lastSlashIndex = path.lastIndexOf("/");

  return lastSlashIndex === -1 ? "" : path.slice(0, lastSlashIndex);
}
