import ProblemFilters from "@/app/(app)/problem/_components/problem-filters";
import type { ProblemFiltersState } from "@/app/(app)/problem/_components/problem-filters";
import ProblemTable from "@/app/(app)/problem/_components/problem-table";
import type { ProblemListItem } from "@/app/(app)/problem/_components/problem-table";
import { ProblemPlatform } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;
const SEARCH_PARAMS_TO_KEEP = ["platform", "tier", "q"] as const;

type ProblemPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    platform?: string | string[];
    q?: string | string[];
    tier?: string | string[];
  }>;
};

export default async function ProblemPage({ searchParams }: ProblemPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const requestedPage = parsePageParam(params.page);
  const where = buildProblemWhere(filters);
  const queryString = buildQueryString(params);

  const [availableTiers, totalCount] = await Promise.all([
    prisma.problemSubmission.findMany({
      distinct: ["tier"],
      orderBy: {
        tier: "asc",
      },
      select: {
        tier: true,
      },
      where: {
        tier: {
          not: null,
        },
      },
    }),
    prisma.problemSubmission.count({ where }),
  ]);

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
    where,
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
        <ProblemFilters
          filters={filters}
          tiers={availableTiers.flatMap((item) => item.tier ?? [])}
        />
        <ProblemTable
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          problems={problems}
          queryString={queryString}
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

function buildProblemWhere(filters: ProblemFiltersState) {
  const where: Prisma.ProblemSubmissionWhereInput = {};

  if (filters.platform) {
    where.platform = filters.platform;
  }

  if (filters.tier) {
    where.tier = filters.tier;
  }

  if (filters.q) {
    where.OR = [
      {
        title: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
      {
        problemId: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

function parseFilters(params: Awaited<ProblemPageProps["searchParams"]>) {
  const platform = parsePlatformParam(params.platform);
  const tier = parseStringParam(params.tier);
  const q = parseStringParam(params.q);

  return {
    platform,
    q,
    tier,
  };
}

function parsePlatformParam(platform: string | string[] | undefined) {
  const value = parseStringParam(platform);

  if (value === ProblemPlatform.BAEKJOON || value === ProblemPlatform.PROGRAMMERS) {
    return value;
  }

  return null;
}

function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}

function buildQueryString(params: Awaited<ProblemPageProps["searchParams"]>) {
  const query = new URLSearchParams();

  for (const key of SEARCH_PARAMS_TO_KEEP) {
    const value = params[key];
    const firstValue = Array.isArray(value) ? value[0] : value;

    if (firstValue?.trim()) {
      query.set(key, firstValue.trim());
    }
  }

  return query.toString();
}
