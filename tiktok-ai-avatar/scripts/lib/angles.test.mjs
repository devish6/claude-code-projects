import { describe, expect, test } from "vitest";

import { ANGLE_REPEAT_DAYS, isRecentlyUsedAngle, pickAngle, validateAngle } from "./angles.mjs";

const approved = {
  id: "best-match",
  frame: "positive",
  evidence: "51.9K-57.2K vs the same account's 6.8K-25.9K baseline",
  status: "approved",
  assertsFacts: false,
};

describe("validateAngle", () => {
  test("accepts an approved angle carrying evidence", () => {
    expect(validateAngle(approved)).toEqual({ ok: true, errors: [] });
  });

  // ⭐ An angle without evidence is a preference. The whole point of this
  // registry is that the frame was measured, not liked.
  test("rejects an angle with no evidence", () => {
    const { ok, errors } = validateAngle({ ...approved, evidence: "" });

    expect(ok).toBe(false);
    expect(errors).toContain("no evidence");
  });

  // 🔴 Formats are copyable. Facts are not. Popular posts cite 1-8, 2-8, 8-8;
  // derived from our own friendship.ts, only 4&9 overlaps. An angle that
  // carries its own number claims would put competitor arithmetic on screen.
  test("rejects an angle that asserts its own numerology facts", () => {
    const { ok, errors } = validateAngle({ ...approved, assertsFacts: true });

    expect(ok).toBe(false);
    expect(errors).toContain("asserts numerology facts -- derive them instead");
  });

  test("rejects an unknown status", () => {
    expect(validateAngle({ ...approved, status: "maybe" }).ok).toBe(false);
  });
});

describe("isRecentlyUsedAngle", () => {
  const state = {
    videos: [{ v: "V30", angleId: "best-match", date: "2026-08-05" }],
  };

  test("an angle used inside the window is recently used", () => {
    expect(isRecentlyUsedAngle(approved, state, "2026-08-09")).toBe(true);
  });

  test("an angle used outside the window is available again", () => {
    expect(isRecentlyUsedAngle(approved, state, "2026-09-20")).toBe(false);
  });

  test("an angle never used is not recently used", () => {
    expect(isRecentlyUsedAngle({ ...approved, id: "self-friendly" }, state, "2026-08-09")).toBe(
      false,
    );
  });

  // Matches state.mjs's inclusive window: day 21 still blocks, day 22 allows
  test("at exactly 21 days, an angle is still recently used; day 22 opens it", () => {
    expect(isRecentlyUsedAngle(approved, state, "2026-08-26")).toBe(true);
    expect(isRecentlyUsedAngle(approved, state, "2026-08-27")).toBe(false);
  });
});

describe("pickAngle", () => {
  const hypothesis = { ...approved, id: "conflict", frame: "conflict", status: "hypothesis" };

  // 🔴 An outward finding is a hypothesis, never a change. It enters the loop
  // and gets tested; it does not get shipped because a competitor ran it.
  test("never picks a hypothesis or a rejected angle", () => {
    expect(pickAngle([hypothesis], { videos: [] }, "2026-08-09")).toBeNull();
  });

  test("picks the approved angle that has gone longest unused", () => {
    const older = { ...approved, id: "self-friendly" };
    const state = { videos: [{ angleId: "best-match", date: "2026-08-08" }] };

    expect(pickAngle([approved, older], state, "2026-08-09").id).toBe("self-friendly");
  });

  test("returns null rather than repeating inside the window", () => {
    const state = { videos: [{ angleId: "best-match", date: "2026-08-08" }] };

    expect(pickAngle([approved], state, "2026-08-09")).toBeNull();
  });

  test("the repeat window is 21 days, matching the hook no-repeat rule", () => {
    expect(ANGLE_REPEAT_DAYS).toBe(21);
  });
});
