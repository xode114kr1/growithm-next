import type {
  GitHubRepositoryInput,
  GitHubWebhookRequestBody,
} from "@/types/github";

const repositoryNamePattern = /^[A-Za-z0-9_.-]+$/;

export type GitHubWebhookResponse = {
  config?: {
    url?: unknown;
  };
  id?: unknown;
  message?: unknown;
};

// 요청 본문에서 유효한 GitHub 저장소 정보를 추출한다.
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

// GitHub 소유자 또는 저장소 이름을 검증하고 정리한다.
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

// GitHub 저장소 URL에서 소유자와 저장소 이름을 추출한다.
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

// GitHub 웹훅 목록 응답이 배열인지 검증한다.
export function isGitHubWebhookList(
  data: unknown,
): data is GitHubWebhookResponse[] {
  return Array.isArray(data);
}

// GitHub 웹훅 응답에서 숫자 ID를 추출한다.
export function getGitHubWebhookId(data: GitHubWebhookResponse | null) {
  return typeof data?.id === "number" ? data.id : null;
}
