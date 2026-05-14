import { describe, expect, it } from "vitest";

import {
  getFriendAvatar,
  getFriendDisplayName,
  getFriendTier,
} from "@/features/friend/utils";

describe("friend display helpers", () => {
  it("uses the user name before the email", () => {
    expect(getFriendDisplayName("Ada Lovelace", "ada@example.com")).toBe(
      "Ada Lovelace",
    );
  });

  it("falls back to email and then an unknown label", () => {
    expect(getFriendDisplayName(null, "ada@example.com")).toBe(
      "ada@example.com",
    );
    expect(getFriendDisplayName("   ", null)).toBe("Unknown Developer");
  });

  it("maps score to a friend tier label and class", () => {
    expect(getFriendTier(100_000)).toEqual({
      tier: "Platinum Tier",
      tierClass:
        "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
    });
  });

  it("uses a configured avatar fallback", () => {
    expect(getFriendAvatar(null)).toBe("https://avatars.githubusercontent.com/u/0?v=4");
  });
});
