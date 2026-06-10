import { getProblemTierDistribution } from "@/services/problem.server";

import GrowthMastery from "./growth-mastery";

export default async function GrowthMasterySection({
  userId,
}: {
  userId: string | undefined;
}) {
  const mastery = await getProblemTierDistribution(userId);

  return <GrowthMastery mastery={mastery} />;
}
