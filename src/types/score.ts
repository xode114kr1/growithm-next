export type ScoreTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export type ScoreTierThreshold<TTier extends string = ScoreTier> = {
  minScore: number;
  tier: TTier;
};
