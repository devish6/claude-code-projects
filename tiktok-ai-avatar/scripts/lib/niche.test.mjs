import { describe, expect, test } from "vitest";

import { MAX_AGE_SKEW_DAYS, rejectAgeSkew, sameAccountLift } from "./niche.mjs";

describe("sameAccountLift", () => {
  // ⭐⭐ The method that produced every outward finding we trust. Across
  // accounts, follower count swamps the signal; within one account it is a
  // controlled comparison.
  const posts = [
    { format: "compatibility", views: 57200 },
    { format: "compatibility", views: 51900 },
    { format: "other", views: 13000 },
    { format: "other", views: 6878 },
    { format: "other", views: 25900 },
  ];

  test("compares a format against the SAME account's other posts", () => {
    const r = sameAccountLift(posts, { format: "compatibility" });

    expect(r.n).toBe(2);
    expect(r.medianFormat).toBe(54550);
    expect(r.medianBaseline).toBe(13000);
    expect(r.lift).toBe(4.2);
  });

  // A single post is an anecdote. Reporting a lift from n=1 is how "the old
  // format won" got believed once already.
  test("refuses to report a lift from a single post", () => {
    expect(sameAccountLift([{ format: "compatibility", views: 57200 }], { format: "compatibility" })).toBeNull();
  });

  test("returns null when the account has no baseline to compare against", () => {
    expect(
      sameAccountLift(
        [
          { format: "compatibility", views: 1 },
          { format: "compatibility", views: 2 },
        ],
        { format: "compatibility" },
      ),
    ).toBeNull();
  });
});

describe("rejectAgeSkew", () => {
  // 🪤 A 30-day-old post against a 3-hour-old one once produced a false "the
  // old format won" conclusion. The guard exists because we got this wrong.
  test("rejects a comparison spanning wildly different post ages", () => {
    const { ok, reason } = rejectAgeSkew(
      [{ timestamp: "2026-07-01T00:00:00Z" }, { timestamp: "2026-08-09T00:00:00Z" }],
      "2026-08-09",
    );

    expect(ok).toBe(false);
    expect(reason).toContain("age");
  });

  test("accepts posts of comparable age", () => {
    expect(
      rejectAgeSkew(
        [{ timestamp: "2026-08-01T00:00:00Z" }, { timestamp: "2026-08-03T00:00:00Z" }],
        "2026-08-09",
      ).ok,
    ).toBe(true);
  });

  test("the tolerated skew is 7 days", () => {
    expect(MAX_AGE_SKEW_DAYS).toBe(7);
  });
});
