import DashboardStats from "./dashboard-stats";
import GrowthMasterySection from "./growth-mastery-section";
import PendingAnalysis from "./pending-analysis";
import PersonalTierCard from "./personal-tier-card";
import QuickLaunch from "./quick-launch";

export default function DashboardContent({
  userId,
}: {
  userId: string | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <PersonalTierCard userId={userId} />
      <DashboardStats userId={userId} />
      <QuickLaunch userId={userId} />
      <GrowthMasterySection userId={userId} />
      <PendingAnalysis userId={userId} />
    </div>
  );
}
