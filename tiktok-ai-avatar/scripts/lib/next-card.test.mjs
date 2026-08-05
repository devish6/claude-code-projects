import { describe, expect, it } from "vitest";

import { assetFor, nextNumber } from "../publish-next-card.mjs";

const rendered = [1, 2, 3, 4, 5, 6, 7, 8, 9];

describe("nextNumber", () => {
  it("starts at 9 when nothing has been posted", () => {
    expect(nextNumber({ kind: "card", posted: [], rendered })).toBe(9);
  });

  /**
   * 🔴 THE REGRESSION THIS FILE EXISTS FOR. The first row the pipeline ever
   * wrote has no `kind` — it predates the field. Read literally, Moolank 8's
   * card looks unposted and the scheduler re-posts a card that is already live.
   */
  it("treats a ledger row with no kind as a card", () => {
    const posted = [{ moolank: 8, mediaId: "17897052021589831" }];
    expect(nextNumber({ kind: "card", posted, rendered: [8, 9] })).toBe(9);
  });

  it("counts card and reel separately for the same number", () => {
    const posted = [{ moolank: 9, kind: "reel", mediaId: "1" }];
    // The reel is out; the CARD for 9 has not been posted, so it is still next.
    expect(nextNumber({ kind: "card", posted, rendered: [9] })).toBe(9);
    expect(nextNumber({ kind: "reel", posted, rendered: [9] })).toBe(null);
  });

  it("skips numbers with no rendered asset", () => {
    expect(nextNumber({ kind: "reel", posted: [], rendered: [9] })).toBe(9);
  });

  it("returns null when the queue is drained", () => {
    const posted = rendered.map((n) => ({ moolank: n, kind: "card" }));
    expect(nextNumber({ kind: "card", posted, rendered })).toBe(null);
  });

  it("descends by number, matching the order the programme actually runs", () => {
    const posted = [{ moolank: 9, kind: "card" }, { moolank: 7, kind: "card" }];
    expect(nextNumber({ kind: "card", posted, rendered })).toBe(8);
  });

  /**
   * 🔴 THE REGRESSION THAT PROMPTED THE DESCENDING CHANGE, PINNED.
   * Real state on 2026-08-05: Moolank 9's reel is out, 7 and 8 are both
   * rendered, and 8 is the one that must go next. Ascending returned 7 and
   * jumped the queue; nothing errored, the wrong number simply posted.
   */
  it("posts 8 next when 9's reel is out and both 7 and 8 are rendered", () => {
    const posted = [{ moolank: 9, kind: "reel" }];
    expect(nextNumber({ kind: "reel", posted, rendered: [7, 8, 9] })).toBe(8);
  });

  /**
   * 🪤 Moolank 8's Instagram row is a CARD. It must not mark 8 finished for
   * reels — the owner explicitly wants 8's reel because it never got one.
   */
  it("does not let 8's infocard suppress 8's reel", () => {
    const posted = [{ moolank: 8, kind: "card" }, { moolank: 9, kind: "reel" }];
    expect(nextNumber({ kind: "reel", posted, rendered: [7, 8, 9] })).toBe(8);
  });
});

describe("assetFor", () => {
  it("points each kind at the file publish-card actually reads", () => {
    expect(assetFor("card", 8)).toBe("out/cards/moolank-8.jpg");
    expect(assetFor("reel", 9)).toBe("out/reels/moolank-9-reel.mp4");
  });
});
