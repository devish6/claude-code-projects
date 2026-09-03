import { describe, expect, it } from "vitest";
import { sec } from "../timing";
import {
  MAX_WORDS,
  QUIET_SCENE_MAX,
  QUIET_SCENE_MIN,
  checkAccentContrast,
  checkAccentWords,
  checkDissolveFits,
  checkGroundChanges,
  checkHoldDurations,
  checkLineLength,
  checkPayoffLate,
  runQuietGates,
  totalFrames,
} from "./scenes";
import { V50_SCENES } from "./v50-two-am";
import { V55_PAYOFF_INDEX, V55_SCENES } from "./v55-already-know";

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in `v50.test.ts`. A guard
 * that cannot fail is worse than none: `expect(ok)` on the real scenes proves
 * only that today's scenes pass, never that the gate would notice if they
 * stopped. Each assertion below is paired with a mutant that must FAIL.
 */

describe("V55 — the quiet format's gates actually fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runQuietGates(V55_SCENES, V55_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("checkGroundChanges FAILS when two neighbours share a ground", () => {
    const mutant = V55_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V55_SCENES[0].bg } : s));
    expect(checkGroundChanges(mutant).ok).toBe(false);
  });

  it("checkHoldDurations FAILS both above the ceiling and below the floor", () => {
    expect(checkHoldDurations(V55_SCENES.map((s, i) => (i === 0 ? { ...s, seconds: 6 } : s))).ok).toBe(false);
    expect(checkHoldDurations(V55_SCENES.map((s, i) => (i === 0 ? { ...s, seconds: 1.2 } : s))).ok).toBe(false);
  });

  it("checkDissolveFits FAILS when a hold cannot contain two dissolves", () => {
    expect(checkDissolveFits(V55_SCENES.map((s, i) => (i === 2 ? { ...s, seconds: 0.9 } : s))).ok).toBe(false);
  });

  it("checkAccentWords FAILS when the accent word is not in its line", () => {
    expect(checkAccentWords(V55_SCENES.map((s, i) => (i === 0 ? { ...s, accentWord: "nowhere" } : s))).ok).toBe(false);
  });

  it("checkAccentWords is CASE SENSITIVE, because the renderer's split is", () => {
    // 🪤 `Line` does an indexOf on the literal. A case-insensitive gate would
    //    pass a word the renderer then fails to find, colouring nothing.
    expect(checkAccentWords(V55_SCENES.map((s, i) => (i === 5 ? { ...s, accentWord: "Deciding" } : s))).ok).toBe(false);
  });

  it("checkAccentContrast FAILS when the accent is the same colour as the ink", () => {
    expect(checkAccentContrast(V55_SCENES.map((s, i) => (i === 4 ? { ...s, accent: s.fg } : s))).ok).toBe(false);
    const near = V55_SCENES.map((s, i) => (i === 4 ? { ...s, accent: "#D8D8D8", fg: "#F2F2F2" } : s));
    expect(checkAccentContrast(near).ok).toBe(false);
  });

  it("checkLineLength FAILS on a line over the word ceiling", () => {
    const long = Array.from({ length: MAX_WORDS + 1 }, () => "word").join(" ");
    const mutant = V55_SCENES.map((s, i) => (i === 0 ? { ...s, line: long, accentWord: undefined } : s));
    expect(checkLineLength(mutant).ok).toBe(false);
  });

  it("checkPayoffLate FAILS when the payoff moves before the 6.4s gate", () => {
    expect(checkPayoffLate(V55_SCENES, 1).ok).toBe(false);
  });
});

/**
 * ⭐⭐⭐ THE COPY'S OWN CLAIMS, ASSERTED AS NEGATIVES. A grep for a phrase that
 * IS present can never detect one that was removed, so the safety story of this
 * cut is written as "it never starts saying X", not "it says Y today".
 */
describe("V55 claims nothing it cannot support", () => {
  const allCopy = V55_SCENES.map((s) => `${s.line} ${s.under ?? ""}`)
    .join(" ")
    .toLowerCase();

  it("contains no digit anywhere — no number, date, or letter value", () => {
    // 🪤 V50 was allowed exactly one numeral ("2 a.m.", an hour). This cut is
    //    allowed none, so the assertion is unconditional.
    expect(allCopy.match(/\d/g) ?? []).toEqual([]);
  });

  it("never asserts a forecast — the claim the market wins on and we cannot derive", () => {
    // `lib/numerology/personal-year.ts` anchors a Personal Year to the FULL DOB,
    // birthday->birthday, and the ruleset has no universal-month convention, so
    // a moolank-segmented monthly forecast is NOT derivable. Refused a third time.
    for (const banned of ["september", "this month", "next month", "will bring", "is coming", "predict"]) {
      expect(allCopy).not.toContain(banned);
    }
  });

  it("never consoles — consolation is 0-for-4 on this account", () => {
    // V34, V35, V37, V38 all softened at the payoff and all died. Scene 4's
    // refusal IS the payload; these phrasings would silently undo it.
    for (const banned of [
      "it's okay",
      "it is okay",
      "you're not alone",
      "don't worry",
      "it's not your fault",
      "it'll be fine",
      "trust the process",
      "follow your heart",
    ]) {
      expect(allCopy).not.toContain(banned);
    }
  });

  it("never leaves a verdict on the reader", () => {
    for (const banned of ["you should", "you failed", "your fault", "weak", "unlucky", "bad ", "coward", "afraid"]) {
      expect(allCopy).not.toContain(banned);
    }
  });

  it("asks for a SEND to a named person, never a save", () => {
    // August corr(reach, saves) = 0.74 — the save count is a FUNCTION of reach.
    expect(allCopy).toContain("send this to");
    expect(allCopy).not.toContain("save this");
    expect(allCopy).not.toContain("screenshot");
    expect(allCopy).not.toContain("comment");
  });

  it("names the send target by a wound, and closes the loop scene 1 opened", () => {
    // ⚔️ The mechanism is Funnel's, the wording is Angle's. The target must be
    //    identifiable in under a second AND tie back to an earlier beat — that
    //    is what "still awake" did for V50's 2 a.m.
    expect(allCopy).not.toContain("behind");
    expect(V55_SCENES[5].line).toContain("months");
    expect(V55_SCENES[1].line).toContain("months");
  });

  it("carries no bare URL — half of views arrive muted from a feed", () => {
    expect(allCopy).not.toContain("numevix.com");
    expect(allCopy).not.toContain("link in bio");
  });

  it("gates nobody out in the second the 1s hold measures", () => {
    // 34 of 38 posts once opened on "BORN 1st, 10th, 19th OR 28th?", which asks
    // ~8 of every 9 viewers to disqualify themselves immediately.
    const first = V55_SCENES[0].line.toLowerCase();
    expect(first).not.toContain("born on");
    expect(first).not.toContain("if you");
    expect(first).toContain("you already know");
  });
});

/**
 * ⭐⭐⭐⭐ THE FORMAT TEST'S OWN INTEGRITY. V55 exists to move ONE variable
 * against V50 — the idea — while the format is held. If a later edit quietly
 * shortens it or re-cuts it as kinetic, the comparison it was built to make
 * silently stops being a comparison. These assertions are that contract.
 */
describe("V55 is a format REPLICATION of V50, not a new experiment", () => {
  it("runs in V50's duration band, so format is not confounded with duration", () => {
    // 🔴 Duration was tested prospectively on V54 (23.25s → 12.42s) and moved
    //    Instagram average watch by nothing: 3,289 ms → 3,069 ms. It is not a
    //    lever on this account, and shortening here would confound the read.
    const seconds = totalFrames(V55_SCENES) / 30;
    expect(seconds).toBeGreaterThan(14);
    expect(seconds).toBeLessThan(18);
  });

  it("is NOT the same length as V50 — duration is a duplicate-detection signal", () => {
    expect(totalFrames(V55_SCENES)).not.toBe(totalFrames(V50_SCENES));
  });

  it("holds the same beat count and payoff position as V50", () => {
    expect(V55_SCENES.length).toBe(V50_SCENES.length);
    expect(V55_PAYOFF_INDEX).toBe(4);
  });

  it("holds longer per beat than the kinetic format can", () => {
    // KINETIC_SCENE_MAX is 2.2s, and you cannot feel something in 1.7 seconds.
    for (const s of V55_SCENES) expect(sec(s.seconds)).toBeGreaterThan(sec(2.2));
  });

  it("carries one sentence per beat — no kicker, no digit, no table", () => {
    for (const s of V55_SCENES) {
      expect(s.line.trim().split(/\s+/).length).toBeLessThanOrEqual(MAX_WORDS);
      expect(Object.keys(s)).not.toContain("table");
      expect(Object.keys(s)).not.toContain("kicker");
    }
  });

  it("puts the ONE light ground on frame 0, because frame 0 is the cover", () => {
    // 🔴 The first V50 render opened on `night-b` and measured frame 0 at mean
    //    luma 19.96 — 3x darker than the V49 cover it was meant to beat.
    expect(V55_SCENES[0].bg).toBe("dawn-a");
  });

  it("closes on a ground that carries its own light source", () => {
    expect(V55_SCENES[V55_SCENES.length - 1].bg).toBe("ember-b");
  });

  it("pairs cream type with the heavy scrim on the pale ground", () => {
    // 🪤 Every scrim darkens DOWNWARD, so dark ink on dawn decays to 1.4:1
    //    against a 3.0:1 floor. Cream + heavy = 17.2:1.
    for (const s of V55_SCENES.filter((x) => x.bg === "dawn-a")) {
      expect(s.scrim).toBe("heavy");
      expect(s.fg.toUpperCase()).toMatch(/^#F{1,2}/);
    }
  });

  it("shares no INTERIOR ground with V50 — a near-duplicate frame is the confound", () => {
    // 🪤 V43 and V44 opened on 99.5% identical pixels and V44's 1s hold halved.
    //    The two endpoints are fixed by measurement (only `dawn-a` is light;
    //    only `ember-b` is self-lit at the close) and are an accepted cost. The
    //    four beats in between must not repeat a post from four days earlier.
    const interior = (s: typeof V55_SCENES) => s.slice(1, -1).map((x) => x.bg);
    for (const bg of interior(V55_SCENES)) {
      expect(interior(V50_SCENES)).not.toContain(bg);
    }
  });

  it("keeps every hold inside the format's own window", () => {
    for (const s of V55_SCENES) {
      expect(sec(s.seconds)).toBeGreaterThanOrEqual(QUIET_SCENE_MIN);
      expect(sec(s.seconds)).toBeLessThanOrEqual(QUIET_SCENE_MAX);
    }
  });

  it("is a NEW idea — it shares no line with V50", () => {
    // ⭐ STANDING RULE: never reuse a published content idea. The format is
    //    reused on purpose; the idea must not be.
    const v50Lines = new Set(V50_SCENES.map((s) => s.line));
    for (const s of V55_SCENES) expect(v50Lines.has(s.line)).toBe(false);
  });
});
