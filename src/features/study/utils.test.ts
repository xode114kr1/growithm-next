import { describe, expect, it } from "vitest";

import {
  getNextTierScore,
  getProgressLabel,
  getStudyTier,
  getTierProgress,
} from "@/features/study/utils";

describe("study score tiers", () => {
  it.each([
    [0, "Bronze"],
    [4_999, "Bronze"],
    [5_000, "Silver"],
    [49_999, "Silver"],
    [50_000, "Gold"],
    [499_999, "Gold"],
    [500_000, "Platinum"],
    [4_999_999, "Platinum"],
    [5_000_000, "Diamond"],
  ])("maps %i XP to %s", (score, tier) => {
    expect(getStudyTier(score)).toBe(tier);
  });

  it("calculates progress within the current study tier range", () => {
    expect(getTierProgress(27_500, "Silver")).toBe(50);
  });

  it("returns the next study tier score", () => {
    expect(getNextTierScore("Gold")).toBe(500_000);
  });

  it("formats study progress labels", () => {
    expect(getProgressLabel(50_000, "Gold")).toBe("50,000 / 500,000 XP");
  });

  it("caps diamond study tier progress", () => {
    expect(getTierProgress(5_000_000, "Diamond")).toBe(100);
    expect(getProgressLabel(5_000_000, "Diamond")).toBe("Max tier");
  });
});
