import { describe, expect, test } from "vitest";

import { mergeDurations, parseFfprobeDuration } from "./duration.mjs";

describe("parseFfprobeDuration", () => {
  test("reads the plain number ffprobe prints with -of default=nw=1:nk=1", () => {
    expect(parseFfprobeDuration("18.048000\n")).toBe(18.05);
  });

  test("rounds to 2dp, because the ledger is read by humans comparing videos", () => {
    expect(parseFfprobeDuration("23.454667")).toBe(23.45);
  });

  // ffprobe prints "N/A" for a stream it cannot measure, and Number("N/A") is
  // NaN. Writing NaN into the ledger produces `null` after a JSON round-trip
  // and silently reads back as "never measured", which is the one state this
  // whole task exists to eliminate.
  test("returns null rather than NaN when ffprobe cannot measure the file", () => {
    expect(parseFfprobeDuration("N/A\n")).toBeNull();
    expect(parseFfprobeDuration("")).toBeNull();
  });
});

describe("mergeDurations", () => {
  test("adds new entries", () => {
    expect(mergeDurations({ V17: 23.45 }, { M2R: 18.05 })).toEqual({
      V17: 23.45,
      M2R: 18.05,
    });
  });

  // A re-render legitimately changes duration (V18 was re-rendered on
  // 2026-08-01 because it ended in 2.8s of silence). The ledger must follow
  // the file, not freeze the first reading.
  test("a later real measurement overwrites an earlier one", () => {
    expect(mergeDurations({ V18: 31.7 }, { V18: 28.9 })).toEqual({ V18: 28.9 });
  });

  // 🔴 The asymmetry that matters: a FAILED probe must never erase a good
  // reading. A deleted file would otherwise wipe the only record of what we
  // shipped, and platforms cannot tell us afterwards.
  test("a null measurement never erases a recorded duration", () => {
    expect(mergeDurations({ V18: 28.9 }, { V18: null })).toEqual({ V18: 28.9 });
  });

  test("a null for an unknown video is not recorded at all", () => {
    expect(mergeDurations({}, { V99: null })).toEqual({});
  });
});
