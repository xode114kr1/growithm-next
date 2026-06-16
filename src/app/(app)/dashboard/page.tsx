import { auth } from "@/lib/auth/auth";
import DashboardChartSection from "./_components/dashboard-chart-section";
import PendingList from "./_components/pending-list";
import DashboardOverviewSection from "./_components/dashboard-overview-section";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <main className="page-shell">
      <div className="page-container space-y-6">
        <DashboardOverviewSection userId={userId} />
        <DashboardChartSection userId={userId} />
        <PendingList userId={userId} />
      </div>
    </main>
  );
}
