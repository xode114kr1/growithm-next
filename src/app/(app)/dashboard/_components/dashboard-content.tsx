import type { DashboardPageData } from "@/types/dashboard";

import DashboardStats from "./dashboard-stats";
import GrowthMastery from "./growth-mastery";
import PendingAnalysis from "./pending-analysis";
import PersonalTierCard from "./personal-tier-card";
import QuickLaunch from "./quick-launch";

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
