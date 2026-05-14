import DashboardContent from "@/features/dashboard/components/dashboard-content";
import DashboardHeader from "@/features/dashboard/components/dashboard-header";
import { getDashboardPageData } from "@/features/dashboard/server/dashboard-page-data";
import { auth } from "@/lib/auth/auth";

export default async function DashboardPage() {
  const session = await auth();
  const dashboardData = await getDashboardPageData(session?.user?.id);

  return (
    <main className="page-shell">
      <div className="page-container">
        <DashboardHeader />
        <DashboardContent dashboardData={dashboardData} />
      </div>
    </main>
  );
}
