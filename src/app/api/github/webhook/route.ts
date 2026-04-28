import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

type WebhookRequestBody = {
  owner?: unknown;
  repo?: unknown;
  repositoryUrl?: unknown;
};

const repositoryNamePattern = /^[A-Za-z0-9_.-]+$/;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  let body: WebhookRequestBody;

  try {
    body = (await request.json()) as WebhookRequestBody;
  } catch {
    return Response.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const repository = parseRepository(body);

  if (!repository) {
    return Response.json(
      { message: "GitHub ID와 Repository 정보를 올바르게 입력해주세요." },
      { status: 400 },
    );
  }

  const account = await prisma.account.findFirst({
    select: {
      access_token: true,
      scope: true,
    },
    where: {
      provider: "github",
      userId: session.user.id,
    },
  });

  if (!account?.access_token) {
    return Response.json(
      {
        message:
          "GitHub access token을 찾을 수 없습니다. GitHub로 다시 로그인해주세요.",
      },
      { status: 401 },
    );
  }

  if (!hasRequiredScope(account.scope, "admin:repo_hook")) {
    return Response.json(
      {
        message:
          "GitHub 웹훅 권한이 없습니다. GitHub로 다시 로그인해 권한을 갱신해주세요.",
      },
      { status: 403 },
    );
  }

  return Response.json(
    {
      message: "웹훅 생성 API 호출 구현이 아직 필요합니다.",
      repository,
    },
    { status: 501 },
  );
}

function parseRepository(body: WebhookRequestBody) {
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

function hasRequiredScope(scope: string | null, requiredScope: string) {
  return scope?.split(/\s+/).includes(requiredScope) ?? false;
}
