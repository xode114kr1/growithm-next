import DashboardHeader from "@/features/dashboard/components/dashboard-header";
import DashboardStats from "@/features/dashboard/components/dashboard-stats";
import GrowthMastery from "@/features/dashboard/components/growth-mastery";
import PendingAnalysis from "@/features/dashboard/components/pending-analysis";
import QuickLaunch from "@/features/dashboard/components/quick-launch";

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <div className="page-container">
        <DashboardHeader />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <DashboardStats />
          <QuickLaunch />
          <GrowthMastery />
          <PendingAnalysis />
        </div>
      </div>
    </main>
  );
}
