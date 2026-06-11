"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell">
      <div className="page-container">
        <section className="app-card px-6 py-14 text-center">
          <p className="text-label-caps text-slate-400">Problem List</p>
          <h1 className="mt-3 text-h3-ui text-on-surface">
            Failed to load problems
          </h1>
          <p className="mx-auto mt-3 max-w-md text-body-sm text-slate-500">
            The problem list could not be loaded. Retry the request after the
            database connection or network recovers.
          </p>
          <button className="btn-primary mt-6" onClick={() => unstable_retry()}>
            Try again
          </button>
        </section>
      </div>
    </main>
  );
}
