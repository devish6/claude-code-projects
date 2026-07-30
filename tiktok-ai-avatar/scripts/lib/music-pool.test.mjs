import { describe, expect, test } from "vitest";

import { TRACK_BPM, trackForTempo } from "./music-pool.mjs";

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
