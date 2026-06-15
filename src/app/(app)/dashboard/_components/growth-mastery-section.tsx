import {
  getProblemTierDistribution,
  getSolvedProblemCount,
} from "@/services/problems/problem.query";

import GrowthMastery from "./growth-mastery";

export default async function GrowthMasterySection({
  userId,
}: {
  userId: string | undefined;
}) {
  const [mastery, solvedCount] = await Promise.all([
    getProblemTierDistribution(userId),
    getSolvedProblemCount(userId),
  ]);

  return <GrowthMastery mastery={mastery} solvedCount={solvedCount} />;
}
