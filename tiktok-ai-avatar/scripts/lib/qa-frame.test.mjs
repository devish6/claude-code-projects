import { describe, expect, test } from "vitest";

import { frameStats, judgeEveryFrame, judgeFirstFrame } from "./qa-frame.mjs";

describe("frameStats", () => {
  test("computes mean and stddev over a raw greyscale buffer", () => {
    expect(frameStats(Uint8Array.from([0, 0, 255, 255]))).toEqual({
      mean: 127.5,
      stddev: 127.5,
    });
  });

  test("a uniform frame has zero spread", () => {
    expect(frameStats(Uint8Array.from([10, 10, 10, 10])).stddev).toBe(0);
  });
});

describe("judgeFirstFrame", () => {
  // 🔴 We shipped an invisible first frame through `useSnap` once already, and
  // the card reels open on a near-black card — M9R's thumbnail is almost
  // black. In a feed that reads as "not a video" in well under a second.
  test("fails a flat frame with no content", () => {
    const gate = judgeFirstFrame({ mean: 4, stddev: 0.4 });

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("stddev");
  });

  test("passes a frame carrying legible contrast", () => {
    expect(judgeFirstFrame({ mean: 96, stddev: 61 }).pass).toBe(true);
  });

  // A fade-in from black produces a frame that is technically non-uniform but
  // still unreadable. Mean luminance has to clear a floor as well as spread.
  test("fails a frame that is dark overall even with some spread", () => {
    expect(judgeFirstFrame({ mean: 3, stddev: 30 }).pass).toBe(false);
  });
});

describe("judgeEveryFrame", () => {
  const flat = (n, stddev) => Array.from({ length: n }, () => ({ mean: 26, stddev }));

  // 🔴🔴 THE DEFECT THIS EXISTS FOR, measured on the published V48 mp4 on
  // 2026-08-28: frame 54 is 50% non-black at mean 55.4, and frame 56 is 0.19%
  // NON-BLACK at mean 7.05 / stddev 5.46 — the scene's copy had faded to
  // nothing over a dark ground. `judgeFirstFrame` reads frame 0 ONLY, so this
  // shipped through six consecutive kinetic cuts and a green suite.
  test("fails when a frame collapses against the video's own typical spread", () => {
    const frames = flat(60, 40);
    frames[56] = { mean: 7.05, stddev: 5.46 };

    const gate = judgeEveryFrame(frames);

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("56");
  });

  // ⛔ THE ABSOLUTE FLOORS MUST NOT BE APPLIED HERE. MIN_MEAN 12 / MIN_STDDEV
  // 18 were calibrated on the LIGHT sage-gold format (frame means ~167). The
  // kinetic format is legitimately dark — V48's night-ground scenes settle at
  // mean 16.6 — and the best post the account ever published fails those
  // floors on 46% of its frames. This gate is RELATIVE to the video it is
  // judging, so a dark cut with nothing wrong with it passes.
  test("passes a legitimately dark video whose frames never collapse", () => {
    expect(judgeEveryFrame(flat(60, 20).map((f) => ({ ...f, mean: 16.6 }))).pass).toBe(true);
  });

  test("names the longest consecutive run of collapsed frames", () => {
    const frames = flat(60, 40);
    for (const i of [20, 21, 22, 23]) frames[i] = { mean: 6, stddev: 4 };

    expect(judgeEveryFrame(frames).detail).toContain("4 frames");
  });

  // A hard cut between two scenes is one frame of one image and the next frame
  // of another. Neither is empty. Nothing about a cut should trip this.
  test("passes a hard cut between a bright scene and a dark one", () => {
    const frames = [...flat(30, 51).map((f) => ({ ...f, mean: 55 })), ...flat(30, 42).map((f) => ({ ...f, mean: 16 }))];

    expect(judgeEveryFrame(frames).pass).toBe(true);
  });
});
