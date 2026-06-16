import { auth } from "@/lib/auth/auth";

import ProblemSection from "./_components/problem-section";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <main className="page-shell">
      <div className="page-container max-w-280 space-y-8">
        <ProblemSection problemId={id} userId={userId} />
      </div>
    </main>
  );
}
