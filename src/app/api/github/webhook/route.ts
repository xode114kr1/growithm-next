import { auth } from "@/lib/auth/auth";
import { registerGitHubWebhook } from "@/services/webhook-registration/webhook-registration.command";
import type { GitHubWebhookRequestBody } from "@/types/github";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  let body: GitHubWebhookRequestBody;

  try {
    body = (await request.json()) as GitHubWebhookRequestBody;
  } catch {
    return Response.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const result = await registerGitHubWebhook({
    body,
    userId: session.user.id,
  });

  return Response.json(result.body, result.status ? { status: result.status } : undefined);
}
