import ProblemFilters from "@/app/(app)/problem/_components/problem-filters";
import type { ProblemFiltersState } from "@/app/(app)/problem/_components/problem-filters";
import type { ProblemSort } from "@/app/(app)/problem/_components/problem-filters";
import ProblemTable from "@/app/(app)/problem/_components/problem-table";
import type { ProblemListItem } from "@/app/(app)/problem/_components/problem-table";
import { ProblemPlatform } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;
const SEARCH_PARAMS_TO_KEEP = ["platform", "tier", "q", "sort"] as const;

type ProblemPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    platform?: string | string[];
    q?: string | string[];
    sort?: string | string[];
    tier?: string | string[];
  }>;
};

export default async function ProblemPage({ searchParams }: ProblemPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const requestedPage = parsePageParam(params.page);
  const where = buildProblemWhere(filters);
  const orderBy = buildProblemOrderBy(filters.sort);
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
    orderBy,
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
        <ProblemHeading filters={filters} totalCount={totalCount} />
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

function ProblemHeading({
  filters,
  totalCount,
}: {
  filters: ProblemFiltersState;
  totalCount: number;
}) {
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
      <form className="flex items-center gap-2" method="get">
        {filters.platform ? (
          <input name="platform" type="hidden" value={filters.platform} />
        ) : null}
        {filters.tier ? (
          <input name="tier" type="hidden" value={filters.tier} />
        ) : null}
        {filters.q ? <input name="q" type="hidden" value={filters.q} /> : null}
        <label
          className="text-body-sm font-medium text-slate-400"
          htmlFor="problem-sort"
        >
          Sort by:
        </label>
        <select
          className="cursor-pointer border-none bg-transparent text-body-sm font-semibold text-primary outline-none"
          defaultValue={filters.sort}
          id="problem-sort"
          name="sort"
        >
          <option value="newest">Latest Published</option>
          <option value="oldest">Oldest Published</option>
          <option value="title">Title</option>
          <option value="platform">Platform</option>
        </select>
        <button className="btn-secondary min-h-10" type="submit">
          Apply
        </button>
      </form>
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

function buildProblemOrderBy(sort: ProblemFiltersState["sort"]) {
  const orderBy: Prisma.ProblemSubmissionOrderByWithRelationInput[] = [];

  if (sort === "oldest") {
    orderBy.push({ createdAt: "asc" });
  } else if (sort === "title") {
    orderBy.push({ title: "asc" });
  } else if (sort === "platform") {
    orderBy.push({ platform: "asc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  orderBy.push({ id: "asc" });

  return orderBy;
}

function parseFilters(
  params: Awaited<ProblemPageProps["searchParams"]>,
): ProblemFiltersState {
  const platform = parsePlatformParam(params.platform);
  const tier = parseStringParam(params.tier);
  const q = parseStringParam(params.q);
  const sort = parseSortParam(params.sort);

  return {
    platform,
    q,
    sort,
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

function parseSortParam(sort: string | string[] | undefined): ProblemSort {
  const value = parseStringParam(sort);

  if (
    value === "newest" ||
    value === "oldest" ||
    value === "title" ||
    value === "platform"
  ) {
    return value;
  }

  return "newest";
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
