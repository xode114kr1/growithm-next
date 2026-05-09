import ProblemFilters from "@/app/(app)/problem/_components/problem-filters";
import ProblemTable from "@/app/(app)/problem/_components/problem-table";
import type { ProblemListItem } from "@/app/(app)/problem/_components/problem-table";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;

type ProblemPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function ProblemPage({ searchParams }: ProblemPageProps) {
  const requestedPage = parsePageParam((await searchParams).page);
  const totalCount = await prisma.problemSubmission.count();
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const problemSubmissions = await prisma.problemSubmission.findMany({
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
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

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
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          problems={problems}
          totalCount={totalCount}
          totalPages={totalPages}
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

function parsePageParam(page: string | string[] | undefined) {
  const value = Array.isArray(page) ? page[0] : page;
  const parsedPage = Number(value);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}
