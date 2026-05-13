import { notFound } from "next/navigation";

import ProblemDescription from "@/features/problem/components/problem-description";
import ProblemDetailHeader from "@/features/problem/components/problem-detail-header";
import ProblemMemoEditor from "@/features/problem/components/problem-memo-editor";
import ProblemMetadata from "@/features/problem/components/problem-metadata";
import ProblemSolutionCode from "@/features/problem/components/problem-solution-code";
import { getProblemDetail } from "@/features/problem/server/problem-detail-data";
import { getProblemShareTargetStudies } from "@/features/problem/server/problem-share-targets";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [problem, shareTargetStudies] = await Promise.all([
    getProblemDetail(id),
    getProblemShareTargetStudies(id),
  ]);

  if (!problem) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="page-container max-w-[1120px] space-y-8">
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
