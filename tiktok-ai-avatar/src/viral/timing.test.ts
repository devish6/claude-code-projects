import { describe, expect, test } from "vitest";

import { ACT, FPS, SCENE_CHANGE, VIRAL_TIMING, makeActs, makeValueScenes, sec } from "./timing";

/**
 * Every video rendered before 2026-07-30 was exactly 17.450667s because
 * durationInFrames was the single constant ACT.total. TikTok read the set as
 * repeated content. These tests make a per-video act structure possible, and
 * assert the properties that must survive it.
 */

const SNAP = { hook: 1.2, build: 3.6, value: 7.4, cta: 2.0 };
const LONG = { hook: 2.4, build: 7.8, value: 14.8, cta: 2.8 };

describe("makeActs", () => {
  test("reproduces the original act structure exactly, so existing videos are unchanged", () => {
    expect(makeActs(VIRAL_TIMING)).toEqual(ACT);
  });

  test("gives different structures different total lengths", () => {
    expect(makeActs(SNAP).total).not.toBe(makeActs(LONG).total);
  });

  test("lays the four acts end to end with no gap or overlap", () => {
    const a = makeActs(SNAP);

    expect(a.hookStart).toBe(0);
    expect(a.buildStart).toBe(a.hookEnd);
    expect(a.valueStart).toBe(a.buildEnd);
    expect(a.ctaStart).toBe(a.valueEnd);
    expect(a.total).toBeGreaterThan(a.ctaStart);
  });

  test("total equals the summed seconds, in frames", () => {
    expect(makeActs(SNAP).total).toBe(sec(1.2 + 3.6 + 7.4 + 2.0));
  });

  test("never produces a structure matching the fingerprinted 17.45s", () => {
    for (const structure of [SNAP, LONG]) {
      expect(makeActs(structure).total).not.toBe(ACT.total);
    }
  });
});

describe("makeValueScenes", () => {
  /**
   * The value act holds a number reveal, a run of trait-pair scenes and a
   * montage recap. Their budgets were hardcoded for one 8.6s act, so a longer
   * act stretched each pair past the 1.2s SCENE_CHANGE ceiling — the rule
   * timing.ts calls governing. Longer acts must add SCENES, not seconds.
   */
  const sumOf = (s: ReturnType<typeof makeValueScenes>) =>
    s.number + s.pairs.reduce((a, b) => a + b, 0) + s.montage;

  test("fills exactly the value act it is given", () => {
    expect(sumOf(makeValueScenes(sec(7.4)))).toBe(sec(7.4));
    expect(sumOf(makeValueScenes(sec(14.8)))).toBe(sec(14.8));
  });

  test("scales with the act — a longer act yields a longer recap", () => {
    expect(makeValueScenes(sec(14.8)).montage).toBeGreaterThan(
      makeValueScenes(sec(7.4)).montage,
    );
  });

  /**
   * Hard-won: 4 traits over 1.0s gave each ~0.23s, below reading threshold.
   * 0.35s each is the measured floor and must survive any act length.
   */
  test("never takes the montage below the readable floor", () => {
    for (const seconds of [6, 7.4, 10, 14.8]) {
      expect(makeValueScenes(sec(seconds)).montage / FPS / 4).toBeGreaterThanOrEqual(0.35);
    }
  });

  test("never holds a trait longer than the scene-change ceiling", () => {
    for (const seconds of [6, 7.4, 10, 14.8, 20]) {
      for (const pair of makeValueScenes(sec(seconds)).pairs) {
        expect(pair / 2 / FPS).toBeLessThanOrEqual(SCENE_CHANGE / FPS);
      }
    }
  });

  test("adds scenes rather than stretching them as the act grows", () => {
    expect(makeValueScenes(sec(14.8)).pairs.length).toBeGreaterThan(
      makeValueScenes(sec(7.4)).pairs.length,
    );
  });

  test("always leaves at least one pair scene", () => {
    expect(makeValueScenes(sec(6)).pairs.length).toBeGreaterThanOrEqual(1);
  });
});
