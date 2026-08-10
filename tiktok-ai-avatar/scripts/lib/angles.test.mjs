import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

import {
  ANGLE_REPEAT_DAYS,
  isRecentlyUsedAngle,
  angleIdForConcept,
  pickAngle,
  unknownLedgerAngles,
  validateAngle,
} from "./angles.mjs";

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

  // 🔴 "Matches the hook no-repeat window — same reason, same rhythm" has to
  // include state.mjs's exclusions, and isRecentlyUsed opens with
  // `if (v.status === "failed") return false`. A failed render never went out,
  // so nothing can read as a repeat of it — but this window counted it and would
  // have locked the angle away for 21 days over a post nobody ever saw.
  test("a FAILED video does not lock its angle out — nothing was ever posted", () => {
    const failed = {
      videos: [{ v: "V30", angleId: "best-match", date: "2026-08-05", status: "failed" }],
    };

    expect(isRecentlyUsedAngle(approved, failed, "2026-08-09")).toBe(false);
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

  /**
   * 🔴 A MALFORMED ENTRY MUST NOT VANISH. pickAngle filtered on
   * `validateAngle(a).ok` and said nothing, so a registry typo shrank the pool
   * silently — and the failure mode is indistinguishable from the healthy one:
   * an empty pool returns null, and null is documented to mean "write a new
   * angle". So a dropped `evidence:` field reads as "we are out of angles" and
   * the operator writes a brand new one instead of fixing one character.
   *
   * Registry contents are config, not input. Loud is correct.
   */
  test("a malformed registry entry throws instead of silently shrinking the pool", () => {
    const broken = { id: "half-written", status: "approved", assertsFacts: false };

    expect(() => pickAngle([approved, broken], { videos: [] }, "2026-08-09")).toThrow(
      /half-written.*no evidence/,
    );
  });

  test("the thrown error names every invalid entry, not just the first", () => {
    const noId = { status: "approved", evidence: "x", assertsFacts: false };
    const badStatus = { ...approved, id: "wrong-status", status: "maybe" };

    expect(() => pickAngle([noId, badStatus], { videos: [] }, "2026-08-09")).toThrow(
      /wrong-status/,
    );
  });
});

/**
 * ⭐⭐⭐ THE JOIN THAT MAKES THE RULE REAL.
 *
 * `isRecentlyUsedAngle` matches `v.angleId === angle.id`. A typo on either
 * side of that equality does not error — it just never matches, and an angle
 * that ran yesterday reads as never-used. The no-repeat window then hands back
 * an angle we just published, which is precisely the standing rule it exists
 * to enforce ("never reuse a previously-published content idea").
 *
 * A silent mismatch is the whole failure mode, so it needs a check that can
 * fail the way the real operation fails: run the real ledger against the real
 * registry.
 */
describe("the ledger joins to the registry", () => {
  const angles = JSON.parse(
    readFileSync(new URL("../../content/angles.json", import.meta.url), "utf8"),
  ).angles;
  const state = JSON.parse(
    readFileSync(new URL("../../content/daily-state.json", import.meta.url), "utf8"),
  );

  test("every angleId written to daily-state.json exists in angles.json", () => {
    expect(unknownLedgerAngles(state, angles)).toEqual([]);
  });

  test("unknownLedgerAngles names an id the registry does not define", () => {
    const bogus = { videos: [{ v: "V99", angleId: "invented-angle", date: "2026-08-09" }] };

    expect(unknownLedgerAngles(bogus, angles)).toEqual(["invented-angle"]);
  });

  // A row with no angleId is history, not an error: every entry written before
  // this field existed has none, and back-dating a guess would be a fabricated
  // measurement. Only a WRONG id is a defect.
  test("an entry with no angleId is not an error", () => {
    const old = { videos: [{ v: "V01", date: "2026-07-16" }] };

    expect(unknownLedgerAngles(old, angles)).toEqual([]);
  });
});

/**
 * 🔴 THE LAST LINK. Recording `angleId` on card reels made the window fire for
 * the M-series; `daily-viral.mjs` composes the V-series and still wrote none,
 * so every V-series row read as "no angle" and the no-repeat rule stayed half
 * enforced. Wiring `angleId: concept.angleId` alone would have been INERT --
 * no concept source sets it -- which is the fail-open shape this whole area
 * keeps producing. So the fallback is not "unknown", it is what the composition
 * demonstrably renders.
 */
describe("angleIdForConcept", () => {
  const angles = JSON.parse(
    readFileSync(new URL("../../content/angles.json", import.meta.url), "utf8"),
  ).angles;

  test("a concept that declares an angle keeps it", () => {
    expect(angleIdForConcept({ angleId: "best-match" }, angles)).toBe("best-match");
  });

  /**
   * ⭐⭐ A ViralVideo is `number` + `numberLabel` + four `traits`, whatever the
   * hook's category says on top. That IS "one number, its ruling planet and
   * traits" — `trait-per-number`, which the registry marks REJECTED on our own
   * measurements. Recording it is how the ledger stops flattering us: the
   * V-series is the same angle as the card reels in a different format.
   */
  test("a concept that declares nothing gets what the composition actually is", () => {
    expect(angleIdForConcept({ category: "identity" }, angles)).toBe("trait-per-number");
  });

  // ⛔ Never silently. An id the registry does not define would join to nothing
  // and read as never-used forever -- the exact silent failure this closes.
  test("a declared angle the registry does not define throws", () => {
    expect(() => angleIdForConcept({ angleId: "made-up" }, angles)).toThrow(/made-up/);
  });
});
