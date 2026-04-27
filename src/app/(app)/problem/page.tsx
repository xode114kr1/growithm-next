import ProblemFilters from "@/app/(app)/problem/_components/problem-filters";
import ProblemTable from "@/app/(app)/problem/_components/problem-table";

export default function ProblemPage() {
  return (
    <main className="page-shell">
      <div className="page-container">
        <ProblemHeading />
        <ProblemFilters />
        <ProblemTable />
      </div>
    </main>
  );
}

function ProblemHeading() {
  return (
    <div className="page-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="page-title mb-2">
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
