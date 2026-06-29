import { auth } from "@/lib/auth/auth";

import { getProblemDetail } from "@/server/problems/problem.query.service";
import { getProblemShareTargetStudies } from "@/server/studies/study.query.service";
import {
  ProblemDescription,
  ProblemMetadata,
  ProblemSolutionCode,
} from "./_components/problem-detail-ui";
import ProblemMemoEditor from "./_components/problem-memo-editor";
import { notFound } from "next/navigation";
import ProblemHeader from "./_components/problem-detail-header";
import AuthRequiredCard from "@/components/ui/auth-required-card";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: problemId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="page-shell">
        <div className="page-container max-w-280">
          <AuthRequiredCard redirectTo={`/problem/${problemId}`} />
        </div>
      </main>
    );
  }

  const [problem, shareTargetStudies] = await Promise.all([
    getProblemDetail({ id: problemId, userId }),
    getProblemShareTargetStudies({
      problemId,
      userId,
    }),
  ]);

  if (!problem) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="page-container max-w-280 space-y-8">
        <ProblemHeader
          problem={problem}
          shareTargetStudies={shareTargetStudies}
        />
        <ProblemMetadata problem={problem} />
        <ProblemMemoEditor initialMemo={problem.memo} problemId={problem.id} />
        <ProblemSolutionCode code={problem.code} />
        <ProblemDescription description={problem.description} />
      </div>
    </main>
  );
}
