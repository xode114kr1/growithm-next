import { auth } from "@/lib/auth/auth";
import { getStudyProblemDetail } from "@/server/studies/study.service";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ problemId: string; studyId: string }>;
  },
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId, studyId } = await params;
  const problem = await getStudyProblemDetail({
    problemId,
    studyId,
    userId,
  });

  if (!problem) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  return Response.json(problem);
}
