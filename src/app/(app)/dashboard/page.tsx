import { auth } from "@/lib/auth/auth";

import GrowthMasterySection from "./_components/growth-mastery-section";
import IntegrationGuideCard from "./_components/integration-guide-card";
import PendingAnalysis from "./_components/pending-analysis";
import PersonalTierCard from "./_components/personal-tier-card";
import QuickLaunch from "./_components/quick-launch";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <PersonalTierCard userId={userId} />
          <IntegrationGuideCard />
          <QuickLaunch userId={userId} />
          <GrowthMasterySection userId={userId} />
          <PendingAnalysis userId={userId} />
        </div>
      </div>
    </main>
  );
}
