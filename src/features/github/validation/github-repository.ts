export type GitHubWebhookRequestBody = {
  owner?: unknown;
  repo?: unknown;
  repositoryUrl?: unknown;
};

export type GitHubRepositoryInput = {
  owner: string;
  repo: string;
};

const repositoryNamePattern = /^[A-Za-z0-9_.-]+$/;

export function parseRepository(
  body: GitHubWebhookRequestBody,
): GitHubRepositoryInput | null {
  const owner = normalizeRepositoryPart(body.owner);
  const repo = normalizeRepositoryPart(body.repo);

  if (owner && repo) {
    return { owner, repo };
  }

  if (typeof body.repositoryUrl !== "string") {
    return null;
  }

  return parseRepositoryUrl(body.repositoryUrl);
}

function normalizeRepositoryPart(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || !repositoryNamePattern.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function parseRepositoryUrl(value: string) {
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);

    if (url.hostname !== "github.com") {
      return null;
    }

    const [owner, repo] = url.pathname
      .replace(/^\/|\/$/g, "")
      .replace(/\.git$/i, "")
      .split("/");

    const normalizedOwner = normalizeRepositoryPart(owner);
    const normalizedRepo = normalizeRepositoryPart(repo);

    if (!normalizedOwner || !normalizedRepo) {
      return null;
    }

    return { owner: normalizedOwner, repo: normalizedRepo };
  } catch {
    return null;
  }
}
