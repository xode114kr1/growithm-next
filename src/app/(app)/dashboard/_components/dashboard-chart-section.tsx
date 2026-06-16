import {
  getProblemTierDistribution,
  getSolvedProblemCount,
} from "@/services/problems/problem.query";
import DashboardChart from "./dashboard-chart";

export default async function DashboardChartSection({
  userId,
}: {
  userId: string | undefined;
}) {
  const [mastery, solvedCount] = await Promise.all([
    getProblemTierDistribution(userId),
    getSolvedProblemCount(userId),
  ]);

  return <DashboardChart mastery={mastery} solvedCount={solvedCount} />;
}
