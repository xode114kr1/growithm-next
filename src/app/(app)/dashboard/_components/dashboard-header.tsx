export default function DashboardHeader() {
  return (
    <header className="page-header flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="page-title">Morning, Developer.</h1>
        <p className="text-body-md text-on-surface-variant">
          Your algorithmic growth is on track for{" "}
          <span className="font-semibold text-secondary">Platinum III</span>{" "}
          this week.
        </p>
      </div>
    </header>
  );
}
