import { describe, expect, test } from "vitest";

import { frameStats, judgeFirstFrame } from "./qa-frame.mjs";

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
