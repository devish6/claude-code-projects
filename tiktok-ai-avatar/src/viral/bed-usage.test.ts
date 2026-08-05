/**
 * Pins the music-bed rule for the card reels.
 *
 * ⭐ WHY A TEST AND NOT A COMMENT. "No bed more than twice" is a rule about the
 * SHAPE OF A TABLE, which is exactly the kind of thing that survives review by
 * eye right up until it doesn't. Assigning a ninth reel is a one-line edit, and
 * the one line that breaks the rule looks identical to the eight that keep it.
 *
 * 🪤 The failure this guards against is silent by nature: a reel with a
 * thrice-used bed renders perfectly, passes every visual check, and only shows
 * up as an account that sounds repetitive weeks later.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { BEDS, BED_LIBRARY } from "./CardReel";
import { MOOLANK_NUMBERS } from "./card-data";

/** Remotion's staticFile() resolves against public/. */
const PUBLIC = join(__dirname, "..", "..", "public");

describe("card reel music beds", () => {
  it("assigns a bed to every Moolank", () => {
    for (const n of MOOLANK_NUMBERS) {
      expect(BEDS[n], `Moolank ${n} has no bed assigned`).toBeDefined();
    }
  });

  it("uses no bed more than twice", () => {
    const uses = new Map<string, number[]>();
    for (const [n, key] of Object.entries(BEDS)) {
      uses.set(key, [...(uses.get(key) ?? []), Number(n)]);
    }
    for (const [key, numbers] of uses) {
      expect(
        numbers.length,
        `bed "${key}" is used ${numbers.length} times (Moolanks ${numbers.join(", ")}) — the limit is 2`,
      ).toBeLessThanOrEqual(2);
    }
  });

  it("only references beds that exist in the library", () => {
    for (const [n, key] of Object.entries(BEDS)) {
      expect(BED_LIBRARY[key], `Moolank ${n} points at unknown bed "${key}"`).toBeDefined();
    }
  });

  it("points every library bed at a file that is really there", () => {
    for (const [key, bed] of Object.entries(BED_LIBRARY)) {
      expect(existsSync(join(PUBLIC, bed.src)), `bed "${key}" missing: public/${bed.src}`).toBe(true);
    }
  });

  /**
   * 🔴 mool-2 AND mool-3 WERE REJECTED BY EAR on 2026-08-05 as wrong for a still
   * card. mool-3 was later reinstated by the owner for a single slot rather than
   * generate a fifth track — mool-2 was not. This pins that distinction so it
   * cannot be undone by someone reading the library and assuming any mool-N is
   * fair game.
   */
  it("keeps mool-2 out, and mool-3 down to a single slot", () => {
    const srcs = Object.values(BEDS).map((k) => BED_LIBRARY[k].src);
    expect(srcs, "mool-2 was rejected in audition — re-audition before using it").not.toContain(
      "music/mool-2.mp3",
    );
    expect(
      srcs.filter((s) => s === "music/mool-3.mp3").length,
      "mool-3 was rejected then reinstated for ONE slot only",
    ).toBe(1);
  });

  /**
   * Every bed is trimmed past its intro, because these tracks fade up under a
   * narrator that no longer exists. A startSeconds of 0 means someone added a
   * bed without measuring where its body begins — the mistake that rendered the
   * first cut at -31.2 dB, 7 dB under the old reel's speech.
   */
  it("starts every bed past its intro and at a sane level", () => {
    for (const [key, bed] of Object.entries(BED_LIBRARY)) {
      expect(bed.startSeconds, `bed "${key}" starts at 0 — measure where its body begins`).toBeGreaterThan(0);
      expect(bed.volume, `bed "${key}" volume out of range`).toBeGreaterThan(0);
      expect(bed.volume, `bed "${key}" volume above unity risks clipping`).toBeLessThanOrEqual(1);
    }
  });
});
