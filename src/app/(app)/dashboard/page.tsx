import { auth } from "@/lib/auth/auth";
import { getDashboardPageData } from "@/services/dashboard/dashboard-page.server";

import DashboardContent from "./_components/dashboard-content";
import DashboardHeader from "./_components/dashboard-header";

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
