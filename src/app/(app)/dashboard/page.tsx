import DashboardHeader from "@/features/dashboard/components/dashboard-header";
import DashboardStats from "@/features/dashboard/components/dashboard-stats";
import GrowthMastery from "@/features/dashboard/components/growth-mastery";
import PendingAnalysis from "@/features/dashboard/components/pending-analysis";
import PersonalTierCard from "@/features/dashboard/components/personal-tier-card";
import QuickLaunch from "@/features/dashboard/components/quick-launch";
import { getDashboardPageData } from "@/features/dashboard/server/dashboard-page-data";
import { auth } from "@/lib/auth/auth";

export default async function DashboardPage() {
  const session = await auth();
  const dashboardData = await getDashboardPageData(session?.user?.id);

  return (
    <main className="page-shell">
      <div className="page-container">
        <DashboardHeader />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <PersonalTierCard personalTier={dashboardData.personalTier} />
          <DashboardStats stats={dashboardData.stats} />
          <QuickLaunch />
          <GrowthMastery mastery={dashboardData.mastery} />
          <PendingAnalysis pendingProblems={dashboardData.pendingProblems} />
        </div>
      </div>
    </main>
  );
}
