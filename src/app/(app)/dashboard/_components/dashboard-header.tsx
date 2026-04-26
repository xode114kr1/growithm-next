export default function DashboardHeader() {
  return (
    <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-h2-editorial text-on-background">
          Morning, Developer.
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Your algorithmic growth is on track for{" "}
          <span className="font-semibold text-secondary">Platinum III</span>{" "}
          this week.
        </p>
      </div>
    </header>
  );
}
