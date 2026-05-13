import { describe, expect, it } from "vitest";

import { ProblemPlatform } from "@/generated/prisma/enums";
import { getProblemExperienceScore } from "@/features/score/problem-score";

describe("problem experience score", () => {
  it.each([
    ["Bronze V", 1],
    ["Bronze IV", 2],
    ["Bronze III", 3],
    ["Bronze II", 4],
    ["Bronze I", 5],
    ["Silver V", 50],
    ["Silver IV", 100],
    ["Silver III", 150],
    ["Silver II", 200],
    ["Silver I", 250],
    ["Gold V", 2_500],
    ["Gold I", 12_500],
    ["Platinum V", 125_000],
    ["Platinum I", 625_000],
    ["Diamond V", 6_250_000],
    ["Diamond I", 31_250_000],
  ])("maps Baekjoon %s to %i XP", (tier, score) => {
    expect(
      getProblemExperienceScore({
        platform: ProblemPlatform.BAEKJOON,
        tier,
      }),
    ).toBe(score);
  });

  it.each([
    ["level 1", 3],
    ["level 2", 150],
    ["level 3", 7_500],
    ["level 4", 375_000],
    ["level 5", 18_750_000],
    ["Lv. 3", 7_500],
  ])("maps Programmers %s to %i XP", (tier, score) => {
    expect(
      getProblemExperienceScore({
        platform: ProblemPlatform.PROGRAMMERS,
        tier,
      }),
    ).toBe(score);
  });

  it("returns 0 for unsupported tiers", () => {
    expect(
      getProblemExperienceScore({
        platform: ProblemPlatform.BAEKJOON,
        tier: "Ruby V",
      }),
    ).toBe(0);
    expect(
      getProblemExperienceScore({
        platform: ProblemPlatform.PROGRAMMERS,
        tier: "level 6",
      }),
    ).toBe(0);
  });
});
