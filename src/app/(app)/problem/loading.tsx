export default function Loading() {
  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div className="app-card min-w-0 p-4" key={item}>
              <div className="mb-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
        <section className="app-card overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="divide-y divide-slate-50">
            {[0, 1, 2, 3, 4].map((item) => (
              <div className="grid gap-4 px-6 py-5 md:grid-cols-[1.8fr_1fr_160px]" key={item}>
                <div className="flex items-start gap-4">
                  <div className="size-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
                <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
                <div className="h-8 w-32 animate-pulse rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
