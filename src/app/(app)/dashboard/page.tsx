import { auth } from "@/lib/auth/auth";
import PendingList from "./_components/pending-problems/pending-list";
import DashboardOverviewSection from "./_components/overview/dashboard-overview-section";
import { getUserPersonalTier } from "@/server/users/user.query.service";
import {
  getPendingProblems,
  getProblemTierDistribution,
  getSolvedProblemCount,
} from "@/server/problems/problem.query.service";
import DashboardChart from "./_components/dashboard-chart";
import AuthRequiredCard from "@/components/ui/auth-required-card";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <AuthRequiredCard />
        </div>
      </main>
    );
  }

  const [personalTier, mastery, solvedCount, pendingProblems] =
    await Promise.all([
      getUserPersonalTier(userId),
      getProblemTierDistribution(userId),
      getSolvedProblemCount(userId),
      getPendingProblems(userId),
    ]);

  return (
    <main className="page-shell">
      <div className="page-container space-y-6">
        <DashboardOverviewSection personalTier={personalTier} />
        <DashboardChart mastery={mastery} solvedCount={solvedCount} />
        <PendingList pendingProblems={pendingProblems} />
      </div>
    </main>
  );
}
