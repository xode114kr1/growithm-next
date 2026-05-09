import { notFound } from "next/navigation";

import ProblemDescription from "@/app/(app)/problem/[id]/_components/problem-description";
import ProblemDetailHeader from "@/app/(app)/problem/[id]/_components/problem-detail-header";
import ProblemMemoEditor from "@/app/(app)/problem/[id]/_components/problem-memo-editor";
import ProblemMetadata from "@/app/(app)/problem/[id]/_components/problem-metadata";
import ProblemSolutionCode from "@/app/(app)/problem/[id]/_components/problem-solution-code";
import { getProblemDetail } from "@/app/(app)/problem/[id]/_lib/problem-detail-data";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = await getProblemDetail(id);

  if (!problem) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="page-container max-w-[1120px] space-y-8">
        <ProblemDetailHeader problem={problem} />
        <ProblemMetadata problem={problem} />
        <ProblemMemoEditor initialMemo={problem.memo} problemId={problem.id} />
        <ProblemSolutionCode code={problem.code} />
        <ProblemDescription description={problem.description} />
      </div>
    </main>
  );
}
