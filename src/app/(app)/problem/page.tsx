import ProblemFilters from "@/app/(app)/problem/_components/problem-filters";
import ProblemTable from "@/app/(app)/problem/_components/problem-table";

export default function ProblemPage() {
  return (
    <main className="min-h-screen bg-surface px-4 pb-16 pt-28 text-on-surface sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1400px]">
        <ProblemHeading />
        <ProblemFilters />
        <ProblemTable />
      </div>
    </main>
  );
}

function ProblemHeading() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="mb-2 text-h2-editorial text-on-background">
          Algorithm Repository
        </h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          Curated collection of 1,248 challenges across major competitive
          platforms. Filter by tier to match your current training level.
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
