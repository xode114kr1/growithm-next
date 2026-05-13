import { describe, expect, it } from "vitest";

import {
  getNextPersonalTierScore,
  getPersonalProgressLabel,
  getPersonalScoreTier,
  getPersonalTierProgress,
} from "@/features/score/utils";

describe("personal score tiers", () => {
  it.each([
    [0, "Bronze"],
    [999, "Bronze"],
    [1_000, "Silver"],
    [9_999, "Silver"],
    [10_000, "Gold"],
    [99_999, "Gold"],
    [100_000, "Platinum"],
    [999_999, "Platinum"],
    [1_000_000, "Diamond"],
  ])("maps %i XP to %s", (score, tier) => {
    expect(getPersonalScoreTier(score)).toBe(tier);
  });

  it("calculates progress within the current personal tier range", () => {
    expect(getPersonalTierProgress(5_500, "Silver")).toBe(50);
  });

  it("returns the next personal tier score", () => {
    expect(getNextPersonalTierScore("Gold")).toBe(100_000);
  });

  it("formats personal progress labels", () => {
    expect(getPersonalProgressLabel(10_000, "Gold")).toBe(
      "10,000 / 100,000 XP",
    );
  });

  it("caps diamond personal tier progress", () => {
    expect(getPersonalTierProgress(1_000_000, "Diamond")).toBe(100);
    expect(getPersonalProgressLabel(1_000_000, "Diamond")).toBe("Max tier");
  });
});
