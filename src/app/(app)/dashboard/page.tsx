import DashboardHeader from "@/app/(app)/dashboard/_components/dashboard-header";
import DashboardStats from "@/app/(app)/dashboard/_components/dashboard-stats";
import GrowthMastery from "@/app/(app)/dashboard/_components/growth-mastery";
import PendingAnalysis from "@/app/(app)/dashboard/_components/pending-analysis";
import QuickLaunch from "@/app/(app)/dashboard/_components/quick-launch";

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
