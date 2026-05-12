import { notFound } from "next/navigation";

import ProblemDescription from "@/app/(app)/problem/[id]/_components/problem-description";
import ProblemDetailHeader from "@/app/(app)/problem/[id]/_components/problem-detail-header";
import ProblemMemoEditor from "@/app/(app)/problem/[id]/_components/problem-memo-editor";
import ProblemMetadata from "@/app/(app)/problem/[id]/_components/problem-metadata";
import ProblemSolutionCode from "@/app/(app)/problem/[id]/_components/problem-solution-code";
import { getProblemDetail } from "@/app/(app)/problem/[id]/_lib/problem-detail-data";
import { getProblemShareTargetStudies } from "@/app/(app)/problem/[id]/_lib/problem-share-targets";

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
