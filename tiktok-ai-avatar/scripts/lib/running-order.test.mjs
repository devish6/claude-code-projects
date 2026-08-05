import { describe, expect, it } from "vitest";

import { byRunningOrder } from "./running-order.mjs";

const at = (date, ...ids) => ids.map((v) => ({ v, date }));
const order = (rows) => [...rows].sort(byRunningOrder).map((r) => r.v);

describe("byRunningOrder", () => {
  it("takes the oldest date first, whatever the ids", () => {
    const rows = [
      { v: "M9R", date: "2026-08-05" },
      { v: "M1R", date: "2026-08-01" },
    ];
    expect(order(rows)[0]).toBe("M1R");
  });

  /**
   * 🔴 THE REGRESSION THIS FILE EXISTS FOR. All nine card reels were queued in
   * one sitting, so they share a date and fall to the tie-break. Alphabetically
   * "M1R" < "M9R", which put Moolank 1 at the head of a queue whose running
   * order is 9, 8, 7… Instagram's scheduler descends independently, so the same
   * day would have posted Moolank 8 to Instagram and Moolank 1 to the other
   * three. Nothing errors — the wrong number simply goes out.
   */
  it("runs card reels 9 down to 1 within a date", () => {
    const rows = at("2026-08-05", "M1R", "M5R", "M9R", "M3R", "M8R");
    expect(order(rows)).toEqual(["M9R", "M8R", "M5R", "M3R", "M1R"]);
  });

  it("still ascends for the V-series, which is what it relies on", () => {
    const rows = at("2026-08-05", "V28", "V17", "V25");
    expect(order(rows)).toEqual(["V17", "V25", "V28"]);
  });

  /**
   * 🪤 A comparator that ordered one pair descending and another ascending
   * could be intransitive, which makes Array.sort's result depend on input
   * order. It is safe only because every "M…" id sorts before every "V…" id,
   * so the two groups never interleave. Pinned, because that is an accident of
   * the naming scheme rather than something the code enforces.
   */
  it("keeps a stable order when card reels and V-series are mixed", () => {
    const rows = at("2026-08-05", "V17", "M1R", "M9R", "V28");
    const forward = order(rows);
    const reversed = order([...rows].reverse());
    expect(forward).toEqual(["M9R", "M1R", "V17", "V28"]);
    expect(reversed).toEqual(forward);
  });

  it("does not treat a non-reel M id as a card reel", () => {
    const rows = at("2026-08-05", "M9R", "MOOL", "M1R");
    // "MOOL" has no M<n>R shape, so it falls back to alphabetical against both.
    expect(order(rows)).toContain("MOOL");
    expect(order(rows).indexOf("M9R")).toBeLessThan(order(rows).indexOf("M1R"));
  });
});
