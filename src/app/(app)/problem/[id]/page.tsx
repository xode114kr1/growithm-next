import { auth } from "@/lib/auth/auth";

import { getProblemDetail } from "@/services/problems/problem.query";
import { getProblemShareTargetStudies } from "@/services/studies/study.query";
import {
  ProblemDescription,
  ProblemMetadata,
  ProblemSolutionCode,
} from "./_components/problem-detail-ui";
import ProblemMemoEditor from "./_components/problem-memo-editor";
import { notFound } from "next/navigation";
import ProblemHeader from "./_components/problem-detail-header";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: problemId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

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
