import { describe, expect, test } from "vitest";

import {
  bucketByWatchTime,
  describeAgainstBaseline,
  findWinnerClusters,
  indexByMediaId,
  joinWindsor,
  median,
  msToSeconds,
  splitAt,
} from "./windsor.mjs";

describe("msToSeconds", () => {
  // 🪤 The single most expensive unit trap in this connector: 3206.0 is 3.2
  // seconds, not 3206. A raw read makes every post look like an hour.
  test("converts milliseconds to seconds at 2dp", () => {
    expect(msToSeconds(3206)).toBe(3.21);
    expect(msToSeconds(11377)).toBe(11.38);
  });

  test("returns null for a missing measurement rather than 0", () => {
    expect(msToSeconds(null)).toBeNull();
    expect(msToSeconds(undefined)).toBeNull();
  });
});

describe("median", () => {
  test("averages the middle two on an even count", () => {
    expect(median([341, 156, 498, 25])).toBe(248.5);
  });

  test("returns the middle value on an odd count", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  test("returns null on an empty set, never 0", () => {
    expect(median([])).toBeNull();
  });
});

describe("joinWindsor", () => {
  const ledger = [
    { date: "2026-07-31", v: "V17", mediaId: "18088987886561276" },
    { date: "2026-08-01", v: "V24", mediaId: "18102622358234073" },
  ];

  test("media_id joins straight to our V-numbers", () => {
    const rows = joinWindsor(
      [{ media_id: "18088987886561276", media_reach: 25, media_reel_avg_watch_time: 6212 }],
      indexByMediaId(ledger),
      { V17: 23.45 },
    );

    expect(rows[0].v).toBe("V17");
    expect(rows[0].watchSeconds).toBe(6.21);
    expect(rows[0].durationSeconds).toBe(23.45);
    expect(rows[0].completion).toBe(0.265);
  });

  // 🔴 33 of our 41 posts predate the publishing ledger entirely. They must
  // still be analysable on reach and watch time — dropping them would throw
  // away every one of the mid-July winners, which are the only high-reach
  // posts we have ever had.
  test("keeps a post with no V-number and no duration", () => {
    const rows = joinWindsor(
      [{ media_id: "17947206261231553", media_reach: 2057, media_reel_avg_watch_time: 7244 }],
      indexByMediaId(ledger),
      {},
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].v).toBeNull();
    expect(rows[0].durationSeconds).toBeNull();
    expect(rows[0].completion).toBeNull();
    expect(rows[0].reach).toBe(2057);
  });
});

describe("bucketByWatchTime", () => {
  test("buckets at the 5.0 and 6.0 second boundaries", () => {
    const rows = [
      { watchSeconds: 6.5, reach: 1400 },
      { watchSeconds: 5.5, reach: 213 },
      { watchSeconds: 4.0, reach: 177 },
      { watchSeconds: 2.3, reach: 203 },
    ];
    const [a, b, c] = bucketByWatchTime(rows);

    expect(a.label).toBe(">= 6.0s");
    expect(a.n).toBe(1);
    expect(b.label).toBe("5.0-5.9s");
    expect(c.n).toBe(2);
    expect(c.medianReach).toBe(190);
  });

  test("ignores rows with no watch-time measurement", () => {
    const buckets = bucketByWatchTime([{ watchSeconds: null, reach: 999 }]);
    expect(buckets.reduce((t, x) => t + x.n, 0)).toBe(0);
  });
});

describe("splitAt", () => {
  test("puts the boundary date itself in the after group", () => {
    const rows = [
      { timestamp: "2026-07-24T03:40:02+0000", reach: 1597 },
      { timestamp: "2026-07-25T04:30:01+0000", reach: 202 },
    ];
    const { before, after } = splitAt(rows, "2026-07-25");

    expect(before).toHaveLength(1);
    expect(after).toHaveLength(1);
  });
});

describe("findWinnerClusters", () => {
  // ⭐⭐ The finding this function exists for: 6 of our 8 all-time winners
  // fall on just two days. That is the shape of a few posts getting picked
  // up, NOT of an account being healthy and then breaking — and the two
  // readings recommend completely different work.
  test("groups high-reach posts that landed within the window", () => {
    const rows = [
      { timestamp: "2026-07-17T12:30:02+0000", reach: 1571 },
      { timestamp: "2026-07-17T12:31:01+0000", reach: 1462 },
      { timestamp: "2026-07-17T12:33:01+0000", reach: 1535 },
      { timestamp: "2026-07-24T03:40:02+0000", reach: 1597 },
    ];
    const clusters = findWinnerClusters(rows, { minReach: 1000, windowHours: 24 });

    expect(clusters).toHaveLength(2);
    expect(clusters[0].posts).toHaveLength(3);
    expect(clusters[1].posts).toHaveLength(1);
  });

  test("posts below the threshold never form a cluster", () => {
    const rows = [
      { timestamp: "2026-08-06T06:30:38+0000", reach: 122 },
      { timestamp: "2026-08-07T06:30:39+0000", reach: 171 },
    ];
    expect(findWinnerClusters(rows, { minReach: 1000, windowHours: 24 })).toEqual([]);
  });
});

describe("describeAgainstBaseline", () => {
  // ⭐ Always against the account's own baseline, never as an absolute. "V29
  // reached 228" means nothing; "228 against a 171 baseline" is a reading.
  test("states the post and the baseline in one line", () => {
    const rows = [
      { v: "V29", watchSeconds: 5.81, reach: 228 },
      { v: "V28", watchSeconds: 2.02, reach: 149 },
      { v: "V27", watchSeconds: 2.89, reach: 171 },
    ];

    expect(describeAgainstBaseline(rows[0], rows)).toBe(
      "V29 avg watch 5.81s vs baseline 2.89s · reach 228 vs baseline 171",
    );
  });
});
