import { describe, expect, test } from "vitest";
import { appendSamples, latestPerVideo, growth, rankByVelocity } from "./metrics.mjs";

const s = (v, platform, collectedAt, views, extra = {}) => ({
  v,
  platform,
  collectedAt,
  views,
  likes: 0,
  comments: 0,
  ...extra,
});

describe("appendSamples", () => {
  test("keeps two runs on different days — that is the series", () => {
    const day1 = [s("V22", "youtube", "2026-07-31T12:00:00Z", 10)];
    const day2 = [s("V22", "youtube", "2026-08-01T12:00:00Z", 90)];

    expect(appendSamples(day1, day2)).toHaveLength(2);
  });

  test("refuses a duplicate of the same run, so a re-run cannot double-count", () => {
    const one = [s("V22", "youtube", "2026-07-31T12:00:00Z", 10)];

    expect(appendSamples(one, one)).toHaveLength(1);
  });

  test("treats the same video on two platforms as separate series", () => {
    const both = [
      s("V22", "youtube", "2026-07-31T12:00:00Z", 10),
      s("V22", "instagram", "2026-07-31T12:00:00Z", 4),
    ];

    expect(appendSamples([], both)).toHaveLength(2);
  });
});

describe("latestPerVideo", () => {
  test("picks by timestamp, not array order", () => {
    // A failed run retried later can append out of order.
    const out = latestPerVideo([
      s("V22", "youtube", "2026-08-02T12:00:00Z", 300),
      s("V22", "youtube", "2026-07-31T12:00:00Z", 10),
    ]);

    expect(out).toHaveLength(1);
    expect(out[0].views).toBe(300);
  });
});

describe("growth", () => {
  test("returns null on a single sample rather than reporting zero growth", () => {
    // Zero would read as "this video is dead" and could retire a good hook.
    // "Not measured twice yet" is a different statement and must stay distinct.
    const one = [s("V22", "youtube", "2026-07-31T12:00:00Z", 10)];

    expect(growth(one, "youtube", "V22")).toBeNull();
  });

  test("measures the delta and the elapsed hours", () => {
    const two = [
      s("V22", "youtube", "2026-07-31T12:00:00Z", 10, { comments: 1 }),
      s("V22", "youtube", "2026-08-01T12:00:00Z", 130, { comments: 9 }),
    ];

    expect(growth(two, "youtube", "V22")).toMatchObject({
      views: 120,
      comments: 8,
      hours: 24,
      samples: 2,
    });
  });

  test("does not mix platforms into one video's growth", () => {
    const mixed = [
      s("V22", "youtube", "2026-07-31T12:00:00Z", 10),
      s("V22", "instagram", "2026-07-31T12:00:00Z", 999),
      s("V22", "youtube", "2026-08-01T12:00:00Z", 30),
    ];

    expect(growth(mixed, "youtube", "V22").views).toBe(20);
  });
});

describe("rankByVelocity", () => {
  test("ranks per hour, so an older video does not win on age alone", () => {
    // V19 gained 240 views over 48h (5/h). V22 gained 120 over 24h (5/h)...
    // make V22 clearly faster so the assertion is about rate, not totals.
    const samples = [
      s("V19", "youtube", "2026-07-29T12:00:00Z", 0),
      s("V19", "youtube", "2026-07-31T12:00:00Z", 240), // 48h → 5/h, bigger total
      s("V22", "youtube", "2026-07-31T00:00:00Z", 0),
      s("V22", "youtube", "2026-07-31T12:00:00Z", 240), // 12h → 20/h
    ];

    const ranked = rankByVelocity(samples);

    expect(ranked[0].v).toBe("V22");
    expect(ranked[0].viewsPerHour).toBe(20);
    // V19 has the same absolute views but is older, so it must rank lower.
    expect(ranked[1].v).toBe("V19");
  });

  test("omits videos measured only once instead of ranking them zero", () => {
    const samples = [s("V22", "youtube", "2026-07-31T12:00:00Z", 500)];

    expect(rankByVelocity(samples)).toEqual([]);
  });
});

describe("velocity needs a real window", () => {
  test("ignores two samples a minute apart instead of reporting 0/h", () => {
    // Happens for real: a --dry-run straight after a live run samples twice
    // within a minute. Dividing by 0.02h either invents a huge rate or reports
    // zero, and zero would read as "this video is dead".
    const samples = [
      s("V22", "instagram", "2026-07-31T15:16:42Z", 4),
      s("V22", "instagram", "2026-07-31T15:17:48Z", 4),
    ];

    expect(rankByVelocity(samples)).toEqual([]);
  });

  test("ranks once the window is at least an hour", () => {
    const samples = [
      s("V22", "instagram", "2026-07-31T12:00:00Z", 0),
      s("V22", "instagram", "2026-07-31T14:00:00Z", 50),
    ];

    expect(rankByVelocity(samples)[0].viewsPerHour).toBe(25);
  });
});
