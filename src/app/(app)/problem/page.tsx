import ProblemFilters from "@/app/(app)/problem/_components/problem-filters";
import ProblemTable from "@/app/(app)/problem/_components/problem-table";
import type { ProblemListItem } from "@/app/(app)/problem/_components/problem-table";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;

export default async function ProblemPage() {
  const [problemSubmissions, totalCount] = await Promise.all([
    prisma.problemSubmission.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        categories: true,
        createdAt: true,
        id: true,
        platform: true,
        problemId: true,
        submittedAtText: true,
        tier: true,
        title: true,
      },
      take: PAGE_SIZE,
    }),
    prisma.problemSubmission.count(),
  ]);

  const problems: ProblemListItem[] = problemSubmissions.map((problem) => ({
    categories: normalizeCategories(problem.categories),
    code: `${problem.platform}-${problem.problemId}`,
    createdAt: problem.createdAt,
    id: problem.id,
    platform: problem.platform,
    problemId: problem.problemId,
    submittedAtText: problem.submittedAtText,
    tier: problem.tier,
    title: problem.title,
  }));

  return (
    <main className="page-shell">
      <div className="page-container">
        <ProblemHeading totalCount={totalCount} />
        <ProblemFilters />
        <ProblemTable
          pageSize={PAGE_SIZE}
          problems={problems}
          totalCount={totalCount}
        />
      </div>
    </main>
  );
}

function ProblemHeading({ totalCount }: { totalCount: number }) {
  return (
    <div className="page-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="page-title mb-2">
          Algorithm Repository
        </h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          Curated collection of {totalCount.toLocaleString()} submitted
          challenges across major competitive platforms.
        </p>
      </div>
      <label className="flex items-center gap-2">
        <span className="text-body-sm font-medium text-slate-400">
          Sort by:
        </span>
        <select className="cursor-pointer border-none bg-transparent text-body-sm font-semibold text-primary outline-none">
          <option>Latest Published</option>
          <option>Difficulty (Low-High)</option>
          <option>Difficulty (High-Low)</option>
          <option>Success Rate</option>
        </select>
      </label>
    </div>
  );
}

function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}
