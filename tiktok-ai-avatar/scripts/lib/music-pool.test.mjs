import { describe, expect, test } from "vitest";

import { BEDS, TRACK_BPM, trackForTempo } from "./music-pool.mjs";

/**
 * The variation engine picks a target tempo per video. If every video still
 * used a ~150 BPM bed the tempo axis would be decorative — transients would
 * keep landing in the same places, which is half of what made the old set
 * look identical to a duplicate detector.
 */
describe("trackForTempo", () => {
  test("every fast-track bed has a measured tempo", () => {
    for (const bpm of Object.values(TRACK_BPM)) {
      expect(typeof bpm).toBe("number");
      expect(bpm).toBeGreaterThan(60);
    }
  });

  test("picks a bed close to the requested tempo", () => {
    const track = trackForTempo(128);

    expect(Math.abs(TRACK_BPM[track] - 128)).toBeLessThan(15);
  });

  test("different targets select different beds", () => {
    expect(trackForTempo(128)).not.toBe(trackForTempo(165));
  });

  test("is deterministic", () => {
    expect(trackForTempo(140)).toBe(trackForTempo(140));
  });

  test("avoids the bed the previous video used when it can", () => {
    const first = trackForTempo(150);

    expect(trackForTempo(150, first)).not.toBe(first);
  });
});

describe("bed length vs structure length", () => {
  test("REGRESSION — never returns a bed shorter than the video it scores", () => {
    // V18 shipped 2.8s of digital silence because the 27.8s `long` structure
    // drew voltSlope, a 25s slice. Every tempo target must have a long-enough
    // answer for the longest structure.
    for (const target of [128, 140, 150, 165]) {
      const bed = trackForTempo(target, undefined, 27.8);
      expect(BEDS[bed].seconds, `${target} BPM picked ${bed}`).toBeGreaterThanOrEqual(27.8);
    }
  });

  test("still returns something when nothing is long enough, rather than failing the run", () => {
    expect(trackForTempo(150, undefined, 9999)).toBeTruthy();
  });

  test("every registered bed covers the longest structure, or is excluded from long videos", () => {
    const short = Object.entries(BEDS).filter(([, b]) => b.seconds < 27.8);
    // Documented, not asserted away: three sourced beds are 25s slices.
    expect(short.map(([k]) => k).sort()).toEqual(["blackVelvetAria", "cashFlowAnthem", "voltSlope"]);
  });
});

describe("tempo coverage", () => {
  test("every tempo the variation engine can pick has a bed within 3 BPM", () => {
    // Before the 2026-08-01 restock there was nothing near 128 or 165, so both
    // targets resolved to a ~150 bed and a third of the tempo axis was fake.
    for (const target of [128, 140, 150, 165]) {
      const bed = trackForTempo(target, undefined, 27.8);
      expect(Math.abs(TRACK_BPM[bed] - target), `${target} -> ${bed}`).toBeLessThan(3);
    }
  });
});
