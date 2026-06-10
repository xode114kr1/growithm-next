import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getProblemDetail } from "@/services/problem.server";
import { getProblemShareTargetStudies } from "@/services/study.server";

import ProblemDescription from "../_components/problem-description";
import ProblemDetailHeader from "../_components/problem-detail-header";
import ProblemMemoEditor from "../_components/problem-memo-editor";
import ProblemMetadata from "../_components/problem-metadata";
import ProblemSolutionCode from "../_components/problem-solution-code";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const [problem, shareTargetStudies] = await Promise.all([
    getProblemDetail(id),
    getProblemShareTargetStudies({
      problemId: id,
      userId: session?.user?.id,
    }),
  ]);

  if (!problem) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="page-container max-w-280 space-y-8">
        <ProblemDetailHeader
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
