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

  // 🔴 FAIL-OPEN, the same shape as rejectAgeSkew's unmeasurable skew. Only the
  // baseline was guarded, so a format whose posts all came back without a view
  // count reported `lift: 0` — "this format gets 0.0x the baseline", maximally
  // wrong and maximally confident, with n=2 printed beside it. The outward scan
  // reads other people's accounts through Chrome, where a missing view count is
  // ordinary. Refuse to answer; never answer zero.
  test("returns null when the format's own views could not be measured", () => {
    expect(
      sameAccountLift(
        [
          { format: "a", views: null },
          { format: "a", views: undefined },
          { format: "b", views: 1000 },
        ],
        { format: "a" },
      ),
    ).toBeNull();
  });

  // A real zero is not the same as an unmeasured one, and must still report.
  test("still reports a lift when the format genuinely scored zero views", () => {
    const r = sameAccountLift(
      [
        { format: "a", views: 0 },
        { format: "a", views: 0 },
        { format: "b", views: 1000 },
      ],
      { format: "a" },
    );

    expect(r.medianFormat).toBe(0);
    expect(r.lift).toBe(0);
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

  // 🪤 The boundary: exactly 7 days is the limit. This protects against
  // the off-by-one mistake where <= instead of < lets 7.1 days through.
  test("exactly 7 days of skew is ACCEPTED", () => {
    expect(
      rejectAgeSkew(
        [{ timestamp: "2026-08-02T00:00:00Z" }, { timestamp: "2026-08-09T00:00:00Z" }],
        "2026-08-09",
      ).ok,
    ).toBe(true);
  });

  test("just over 7 days of skew is REJECTED", () => {
    expect(
      rejectAgeSkew(
        [{ timestamp: "2026-08-01T12:00:00Z" }, { timestamp: "2026-08-09T00:00:00Z" }],
        "2026-08-09",
      ).ok,
    ).toBe(false);
  });

  // 🪤 The guard refuses comparisons it cannot measure. An unparseable
  // timestamp means we don't know the skew — that is failure, not success.
  test("2 posts where one timestamp is unparseable → skew unmeasurable", () => {
    const { ok, reason } = rejectAgeSkew(
      [{ timestamp: "invalid" }, { timestamp: "2026-08-09T00:00:00Z" }],
      "2026-08-09",
    );

    expect(ok).toBe(false);
    expect(reason).toContain("unmeasurable");
  });

  test("2 posts where one timestamp is missing → skew unmeasurable", () => {
    const { ok, reason } = rejectAgeSkew(
      [{ timestamp: undefined }, { timestamp: "2026-08-09T00:00:00Z" }],
      "2026-08-09",
    );

    expect(ok).toBe(false);
    expect(reason).toContain("unmeasurable");
  });

  test("1 post with unparseable timestamp → ok:true (nothing to compare)", () => {
    expect(
      rejectAgeSkew([{ timestamp: "invalid" }], "2026-08-09").ok,
    ).toBe(true);
  });
});
