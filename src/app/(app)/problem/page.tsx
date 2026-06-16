import { auth } from "@/lib/auth/auth";
import type { ProblemPageSearchParams } from "@/types/problem";

import ProblemFiltersSection from "./_components/problem-filters-section";
import ProblemListSection from "./_components/problem-list-section";

type ProblemPageProps = {
  searchParams: Promise<ProblemPageSearchParams>;
};

export default async function ProblemPage({ searchParams }: ProblemPageProps) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <main className="page-shell">
      <div className="page-container">
        <ProblemFiltersSection searchParams={params} userId={userId} />
        <ProblemListSection searchParams={params} userId={userId} />
      </div>
    </main>
  );
}
