import { describe, expect, test } from "vitest";

import { ACT, FPS, SCENE_CHANGE, VIRAL_TIMING, makeActs, makeValueScenes, sec } from "./timing";
import { PAYLOAD_BY_FRAME } from "./qa";
import beatMap from "../../content/beat-maps.json";
import { CONTRARIAN_THIRTEEN } from "./templates";

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

/**
 * Beat-snapping inside the value act (2026-08-07).
 *
 * `snapActsToBeats` only ever snapped the four ACT boundaries; every cut inside
 * the value act was a proportional division and beat-blind, drifting +49…+125ms
 * against `starlightV03` — 3–4 frames, on five of the video's seven cuts.
 */
describe("makeValueScenes beat-snapping", () => {
  const THIRTEEN = CONTRARIAN_THIRTEEN.structure!;
  const acts = makeActs(THIRTEEN);
  const valueFrames = acts.valueEnd - acts.valueStart;
  // starlightV03's tracked map, the bed this shipped on.
  const beats = beatMap.starlightV03.beatsMs.map((ms: number) => ms / 1000);

  /** Frame offsets of every cut inside the value act. */
  const cutFrames = (s: ReturnType<typeof makeValueScenes>) => {
    const out = [acts.valueStart];
    let f = acts.valueStart + s.number;
    out.push(f);
    for (const p of s.pairs.slice(0, -1)) {
      f += p;
      out.push(f);
    }
    return out;
  };

  test("every cut in the video lands within half a frame of a tracked beat", () => {
    const snapped = makeValueScenes(valueFrames, { beats, startFrame: acts.valueStart, traitCount: 4 });
    const all = [
      acts.hookEnd,
      acts.buildEnd,
      acts.ctaStart,
      acts.total,
      ...cutFrames(snapped),
    ];

    for (const frame of all) {
      const t = frame / FPS;
      const nearest = beats.reduce((b, x) => (Math.abs(x - t) < Math.abs(b - t) ? x : b));
      expect(Math.abs(t - nearest) * 1000).toBeLessThanOrEqual(1000 / FPS / 2);
    }
  });

  test("beats actually MOVE the cuts — a positive control", () => {
    const plain = makeValueScenes(valueFrames);
    const snapped = makeValueScenes(valueFrames, { beats, startFrame: acts.valueStart, traitCount: 4 });
    expect(snapped).not.toEqual(plain);
  });

  test("snapping never breaches the SCENE_CHANGE ceiling", () => {
    const snapped = makeValueScenes(valueFrames, { beats, startFrame: acts.valueStart, traitCount: 4 });
    for (const p of snapped.pairs) expect(p).toBeLessThanOrEqual(SCENE_CHANGE * 2);
  });

  test("the value act still totals exactly its budget", () => {
    const s = makeValueScenes(valueFrames, { beats, startFrame: acts.valueStart, traitCount: 4 });
    expect(s.number + s.pairs.reduce((a, b) => a + b, 0) + s.montage).toBe(valueFrames);
  });

  test("no beats is identical to the old proportional split", () => {
    expect(makeValueScenes(valueFrames, { startFrame: acts.valueStart })).toEqual(
      makeValueScenes(valueFrames),
    );
  });
});

/**
 * 🔴 No pair scene may ever be empty.
 *
 * `ceil(traits / scenes)` traits per scene, sliced by index, put [0,1] and
 * [2,3] in the first two of three scenes and sliced past the end for the third
 * — a ~1.7s hole of bare background in the middle of the video. V03 shipped
 * with it. The frame is not blank, just empty of content, which is why weeks of
 * review missed it and 303 passing tests said nothing.
 */
describe("trait distribution never leaves a scene empty", () => {
  /** Mirrors the chunking in ViralVideo.tsx. */
  const chunk = (traitCount: number, scenes: number) => {
    const base = Math.floor(traitCount / scenes);
    const extra = traitCount % scenes;
    const out: number[] = [];
    for (let i = 0; i < scenes; i++) out.push(base + (i < extra ? 1 : 0));
    return out;
  };

  test("4 traits over 3 scenes is 2,1,1 — the shape V03 got wrong", () => {
    expect(chunk(4, 3)).toEqual([2, 1, 1]);
  });

  test("no scene is empty for any act length the engine can produce", () => {
    for (const seconds of [6, 7, 7.4, 8, 8.565, 8.6, 10.4, 12.4]) {
      const scenes = makeValueScenes(sec(seconds)).pairs.length;
      // The props contract is exactly 4 traits.
      if (scenes > 4) continue; // guarded separately below
      for (const size of chunk(4, scenes)) expect(size).toBeGreaterThan(0);
    }
  });

  test("every trait is shown exactly once", () => {
    for (const scenes of [1, 2, 3, 4]) {
      expect(chunk(4, scenes).reduce((a, b) => a + b, 0)).toBe(4);
    }
  });

  test("no realistic act length asks for more scenes than there are traits", () => {
    for (const seconds of [6, 7.4, 8.565, 8.6, 10.4, 12.4, 14.8]) {
      expect(makeValueScenes(sec(seconds)).pairs.length).toBeLessThanOrEqual(4);
    }
  });
});

/**
 * One trait per scene (2026-08-07).
 *
 * The first fix for the empty scene spread 4 traits as 2,1,1 — which put two
 * traits in a 50-frame scene, so the staggered second bullet showed for 14
 * frames (0.47s) and the pacing went lopsided. Scene COUNT now follows the
 * trait count, so the stagger never fires and every trait gets its own beat.
 */
describe("scene count follows trait count", () => {
  test("4 traits get 4 scenes, so no scene holds two", () => {
    const s = makeValueScenes(sec(8.565), { traitCount: 4 });
    expect(s.pairs.length).toBe(4);
  });

  test("every scene is readable and none breaches the ceiling", () => {
    for (const seconds of [7.4, 8.565, 8.6, 10.4, 12.4, 14.8]) {
      for (const p of makeValueScenes(sec(seconds), { traitCount: 4 }).pairs) {
        expect(p).toBeGreaterThanOrEqual(30);
        expect(p).toBeLessThanOrEqual(SCENE_CHANGE * 2);
      }
    }
  });

  test("never drops below what the SCENE_CHANGE ceiling requires", () => {
    for (const seconds of [7.4, 8.565, 10.4, 12.4, 14.8]) {
      const withTraits = makeValueScenes(sec(seconds), { traitCount: 4 }).pairs.length;
      const byTimeOnly = makeValueScenes(sec(seconds)).pairs.length;
      expect(withTraits).toBeGreaterThanOrEqual(byTimeOnly);
    }
  });

  test("omitting traitCount leaves the old behaviour untouched", () => {
    expect(makeValueScenes(sec(8.6))).toEqual(makeValueScenes(sec(8.6), {}));
  });
});

/**
 * Cycle 1's single change: the payload lands inside 2 seconds.
 *
 * The old structure held the payload until 6.4s behind a `build` act whose
 * written contract was "open a curiosity loop, never fully resolve". Viewers
 * read the hook — that is why they were still there at 1.6s — and then left
 * during the 4.8 seconds before anything they were promised arrived.
 *
 * STRUCTURES-based assertions for this same change live in
 * scripts/lib/variation.test.mjs (a .mjs test can import TypeScript under
 * vitest without tripping tsc's `allowJs` requirement; this file cannot
 * import a .mjs module and stay lint-clean).
 */
describe("the payload lands inside 2 seconds", () => {
  test("the default structure pays off by frame 60", () => {
    expect(makeActs(VIRAL_TIMING).valueStart).toBeLessThanOrEqual(PAYLOAD_BY_FRAME);
  });
});
