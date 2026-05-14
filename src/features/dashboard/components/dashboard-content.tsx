import DashboardStats from "@/features/dashboard/components/dashboard-stats";
import GrowthMastery from "@/features/dashboard/components/growth-mastery";
import PendingAnalysis from "@/features/dashboard/components/pending-analysis";
import PersonalTierCard from "@/features/dashboard/components/personal-tier-card";
import QuickLaunch from "@/features/dashboard/components/quick-launch";
import type { DashboardPageData } from "@/features/dashboard/types";

export default function DashboardContent({
  dashboardData,
}: {
  dashboardData: DashboardPageData;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <PersonalTierCard personalTier={dashboardData.personalTier} />
      <DashboardStats stats={dashboardData.stats} />
      <QuickLaunch quickLaunches={dashboardData.quickLaunches} />
      <GrowthMastery mastery={dashboardData.mastery} />
      <PendingAnalysis pendingProblems={dashboardData.pendingProblems} />
    </div>
  );
}
