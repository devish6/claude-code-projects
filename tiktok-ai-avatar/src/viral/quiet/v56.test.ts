import { describe, expect, it } from "vitest";
import { sec } from "../timing";
import {
  MAX_WORDS,
  QUIET_SCENE_MAX,
  QUIET_SCENE_MIN,
  checkAccentContrast,
  checkAccentWords,
  checkGroundChanges,
  checkLineLength,
  checkPayoffLate,
  runQuietGates,
  totalFrames,
} from "./scenes";
import { V50_PAYOFF_INDEX, V50_SCENES } from "./v50-two-am";
import { V55_PAYOFF_INDEX, V55_SCENES } from "./v55-already-know";
import { V56_PAYOFF_INDEX, V56_SCENES } from "./v56-everyone-comes-to-you";

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in `v50.test.ts` and
 * `v55.test.ts`. A guard that cannot fail is worse than none: `expect(ok)` on
 * the real scenes proves only that today's scenes pass, never that the gate
 * would notice if they stopped. Each assertion below is paired with a mutant
 * that must FAIL.
 */

describe("V56 — the quiet format's gates actually fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runQuietGates(V56_SCENES, V56_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("checkGroundChanges FAILS when two neighbours share a ground", () => {
    const mutant = V56_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V56_SCENES[0].bg } : s));
    expect(checkGroundChanges(mutant).ok).toBe(false);
    expect(checkGroundChanges(V56_SCENES).ok).toBe(true);
  });

  it("checkAccentWords FAILS when an accent word is not in its own line", () => {
    const mutant = V56_SCENES.map((s, i) => (i === 0 ? { ...s, accentWord: "not present" } : s));
    expect(checkAccentWords(mutant).ok).toBe(false);
    expect(checkAccentWords(V56_SCENES).ok).toBe(true);
  });

  it("checkAccentContrast FAILS when the accent is the colour of the ink", () => {
    // 🔴 The class this repo keeps paying for: the first V50 render set
    //    accent #D8D8D8 against fg #F2F2F2 — distance 26, invisible on a phone,
    //    every gate green. checkAccentWords proves the word EXISTS, never that
    //    the viewer can see it is emphasised.
    const mutant = V56_SCENES.map((s, i) => (i === 4 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(mutant).ok).toBe(false);
    expect(checkAccentContrast(V56_SCENES).ok).toBe(true);
  });

  it("checkLineLength FAILS on a line that would wrap to three lines", () => {
    const mutant = V56_SCENES.map((s, i) =>
      i === 0 ? { ...s, line: Array.from({ length: MAX_WORDS + 1 }, () => "word").join(" ") } : s,
    );
    expect(checkLineLength(mutant).ok).toBe(false);
    expect(checkLineLength(V56_SCENES).ok).toBe(true);
  });

  it("checkPayoffLate FAILS when the payoff is moved early", () => {
    expect(checkPayoffLate(V56_SCENES, 1).ok).toBe(false);
    expect(checkPayoffLate(V56_SCENES, V56_PAYOFF_INDEX).ok).toBe(true);
  });
});

describe("V56 is the THIRD cut in the format, and changes only the idea", () => {
  it("runs in the band both predecessors ran in, so format is not confounded with duration", () => {
    // 🔴 Duration was tested prospectively on V54 (23.25s → 12.42s) and moved
    //    Instagram average watch by nothing: 3,289 ms → 3,069 ms. Retired.
    const seconds = totalFrames(V56_SCENES) / 30;
    expect(seconds).toBeGreaterThan(14);
    expect(seconds).toBeLessThan(18);
  });

  it("is a different length from BOTH predecessors — duration is a duplicate signal", () => {
    expect(totalFrames(V56_SCENES)).not.toBe(totalFrames(V50_SCENES));
    expect(totalFrames(V56_SCENES)).not.toBe(totalFrames(V55_SCENES));
  });

  it("holds the same beat count and payoff position as both predecessors", () => {
    expect(V56_SCENES.length).toBe(V50_SCENES.length);
    expect(V56_SCENES.length).toBe(V55_SCENES.length);
    expect(V56_PAYOFF_INDEX).toBe(4);
    expect(V56_PAYOFF_INDEX).toBe(V50_PAYOFF_INDEX);
    expect(V56_PAYOFF_INDEX).toBe(V55_PAYOFF_INDEX);
  });

  it("holds longer per beat than the kinetic format can", () => {
    for (const s of V56_SCENES) expect(sec(s.seconds)).toBeGreaterThan(sec(2.2));
  });

  it("keeps every hold inside the format's own window", () => {
    for (const s of V56_SCENES) {
      expect(sec(s.seconds)).toBeGreaterThanOrEqual(QUIET_SCENE_MIN);
      expect(sec(s.seconds)).toBeLessThanOrEqual(QUIET_SCENE_MAX);
    }
  });

  it("carries one sentence per beat — no kicker, no digit, no table", () => {
    for (const s of V56_SCENES) {
      expect(s.line.trim().split(/\s+/).length).toBeLessThanOrEqual(MAX_WORDS);
      expect(Object.keys(s)).not.toContain("table");
      expect(Object.keys(s)).not.toContain("kicker");
    }
  });

  it("puts the ONE light ground on frame 0, because frame 0 is the cover", () => {
    expect(V56_SCENES[0].bg).toBe("dawn-a");
  });

  it("closes on a ground that carries its own light source", () => {
    expect(V56_SCENES[V56_SCENES.length - 1].bg).toBe("ember-b");
  });

  it("pairs cream type with the heavy scrim on the pale ground", () => {
    for (const s of V56_SCENES.filter((x) => x.bg === "dawn-a")) {
      expect(s.scrim).toBe("heavy");
      expect(s.fg.toUpperCase()).toMatch(/^#F{1,2}/);
    }
  });
});

describe("V56's ground gate — scoped to the neighbour, hard on the payoff", () => {
  /**
   * ⚖️ THE RULING THIS ENFORCES, AND WHY IT IS NARROWER THAN V55'S.
   *
   * Thirteen grounds exist. `dawn-a` is fixed at frame 0 and `ember-b` at the
   * close, leaving eleven for four interior beats. V50 spent four and V55 spent
   * four more, so only THREE were unused — one short of what a third cut needs.
   * V55's gate ("share no interior ground with V50") is therefore unsatisfiable
   * here, and a gate that cannot be satisfied gets deleted rather than obeyed.
   *
   * The documented failure is V43/V44: two CONSECUTIVE cuts opening on 99.5%
   * identical pixels, where V44's 1-second hold halved. Distance in TIME is the
   * active ingredient. So the gate keeps its force where time is short and
   * where the frames matter most, and relaxes where neither holds.
   */

  const interior = (s: typeof V56_SCENES) => s.slice(1, -1).map((x) => x.bg);

  it("shares no INTERIOR ground with V55, the cut one day older", () => {
    for (const bg of interior(V56_SCENES)) {
      expect(interior(V55_SCENES)).not.toContain(bg);
    }
  });

  it("puts its payoff on a ground neither predecessor used for theirs", () => {
    // The three most important frames the account has cut must not share pixels.
    const payoff = V56_SCENES[V56_PAYOFF_INDEX].bg;
    expect(payoff).not.toBe(V50_SCENES[V50_PAYOFF_INDEX].bg);
    expect(payoff).not.toBe(V55_SCENES[V55_PAYOFF_INDEX].bg);
  });

  it("puts its payoff on a ground never used in this format at all", () => {
    const spent = new Set([...V50_SCENES, ...V55_SCENES].map((s) => s.bg));
    expect(spent.has(V56_SCENES[V56_PAYOFF_INDEX].bg)).toBe(false);
  });

  it("POSITIVE CONTROL: the V55 gate would fire if an interior were reused", () => {
    // Without this, the assertion above passes just as happily against a cut
    // that shares nothing because it shares no grounds at all.
    const mutant = V56_SCENES.map((s, i) => (i === 2 ? { ...s, bg: V55_SCENES[2].bg } : s));
    const shared = interior(mutant).filter((bg) => interior(V55_SCENES).includes(bg));
    expect(shared.length).toBeGreaterThan(0);
  });
});

describe("V56 claims nothing a commenter could contradict", () => {
  /**
   * ⭐⭐⭐ ASSERT THE NEGATIVE. A grep for a phrase that is PRESENT can never
   * detect one that was REMOVED — and the failure mode here is a later edit
   * quietly reintroducing a number to "make it more numerology".
   */
  const allText = V56_SCENES.flatMap((s) => [s.line, s.under ?? ""]).join(" ");

  it("contains no digit anywhere in its copy", () => {
    expect(allText).not.toMatch(/\d/);
  });

  it("names no number, planet, or system term", () => {
    for (const word of [
      "moolank",
      "bhagyank",
      "driver",
      "conductor",
      "mahadasha",
      "antardasha",
      "venus",
      "ketu",
      "mercury",
      "birth number",
      "name number",
    ]) {
      expect(allText.toLowerCase()).not.toContain(word);
    }
  });

  it("POSITIVE CONTROL: the digit assertion fires on a mutant that adds one", () => {
    const mutant = [...V56_SCENES.map((s) => s.line), "born on the 6th"].join(" ");
    expect(mutant).toMatch(/\d/);
  });

  it("promises a conversation, not a forecast", () => {
    // 🪤 "what your chart says you're carrying" is a promise ABOUT a reading.
    //    A forecast would be a claim, and the moolank-segmented monthly forecast
    //    is still not derivable — refused here as in V55.
    const payoff = V56_SCENES[V56_PAYOFF_INDEX];
    expect(payoff.under).toContain("chart says");
    expect(allText.toLowerCase()).not.toContain("will happen");
  });
});

describe("V56 is a NEW idea — the format is reused, the idea is not", () => {
  it("shares no line with V50 or V55", () => {
    // ⭐ STANDING RULE: never reuse a published content idea. Bites hardest on
    //    the ideas that worked, which is exactly the situation here.
    const spent = new Set([...V50_SCENES, ...V55_SCENES].map((s) => s.line));
    for (const s of V56_SCENES) expect(spent.has(s.line)).toBe(false);
  });

  it("shares no UNDER line with either predecessor, except the format's signature", () => {
    // "they'll know why · @numevix" is the ask's fixed shape and is reused on
    // purpose; everything else must be new.
    const SIGNATURE = "they'll know why · @numevix";
    const spent = new Set(
      [...V50_SCENES, ...V55_SCENES].map((s) => s.under ?? "").filter((u) => u && u !== SIGNATURE),
    );
    for (const s of V56_SCENES) {
      if (!s.under || s.under === SIGNATURE) continue;
      expect(spent.has(s.under)).toBe(false);
    }
  });

  it("opens on a different wound from both predecessors", () => {
    // V50 = 2 a.m. after it went wrong. V55 = the decision nobody will
    // authorise. V56 = the person the other two viewers phone.
    expect(V56_SCENES[0].line).not.toBe(V50_SCENES[0].line);
    expect(V56_SCENES[0].line).not.toBe(V55_SCENES[0].line);
    expect(V56_SCENES[0].line.toLowerCase()).toContain("everyone comes to");
  });

  it("keeps the refusal shape at the payoff — the format's contract", () => {
    // ⭐ The one thing deliberately held constant across all three: the payoff
    //    withholds the consolation the viewer is braced for. Consolation is
    //    0-for-4 on this account (V34, V35, V37, V38).
    // 🪤 The wording is NOT constant — V50 says "I won't tell you it's fine",
    //    V55 "I'm not going to tell you it'll work out". Asserting the literal
    //    of the newest cut would have been a gate that only ever described
    //    itself, so this matches the SHAPE: a first-person refusal to reassure.
    const REFUSAL = /^i(?: won't|'m not going to| am not going to) tell you\b/;
    for (const scenes of [V50_SCENES, V55_SCENES, V56_SCENES]) {
      expect(scenes[4].line.toLowerCase()).toMatch(REFUSAL);
    }
  });

  it("POSITIVE CONTROL: the refusal shape rejects a consoling payoff", () => {
    const REFUSAL = /^i(?: won't|'m not going to| am not going to) tell you\b/;
    expect("it's going to be fine, i promise.").not.toMatch(REFUSAL);
    expect("you deserve support too.").not.toMatch(REFUSAL);
  });
});
