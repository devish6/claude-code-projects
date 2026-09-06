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
import { V57_PAYOFF_INDEX, V57_SCENES } from "./v57-seen-this-ending";

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in the three tests before it.
 * A guard that cannot fail is worse than none: `expect(ok)` on the real scenes
 * proves only that today's scenes pass, never that the gate would notice if
 * they stopped. Each assertion below is paired with a mutant that must FAIL.
 */

describe("V57 — the quiet format's gates actually fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runQuietGates(V57_SCENES, V57_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("checkGroundChanges FAILS when two neighbours share a ground", () => {
    const mutant = V57_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V57_SCENES[0].bg } : s));
    expect(checkGroundChanges(mutant).ok).toBe(false);
    expect(checkGroundChanges(V57_SCENES).ok).toBe(true);
  });

  it("checkAccentWords FAILS when an accent word is not in its own line", () => {
    const mutant = V57_SCENES.map((s, i) => (i === 0 ? { ...s, accentWord: "not present" } : s));
    expect(checkAccentWords(mutant).ok).toBe(false);
    expect(checkAccentWords(V57_SCENES).ok).toBe(true);
  });

  it("checkAccentContrast FAILS when the accent is the colour of the ink", () => {
    const mutant = V57_SCENES.map((s, i) => (i === 4 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(mutant).ok).toBe(false);
    expect(checkAccentContrast(V57_SCENES).ok).toBe(true);
  });

  it("checkLineLength FAILS on a line that would wrap to three lines", () => {
    const mutant = V57_SCENES.map((s, i) =>
      i === 0 ? { ...s, line: Array.from({ length: MAX_WORDS + 1 }, () => "word").join(" ") } : s,
    );
    expect(checkLineLength(mutant).ok).toBe(false);
    expect(checkLineLength(V57_SCENES).ok).toBe(true);
  });

  it("checkPayoffLate FAILS when the payoff is moved early", () => {
    expect(checkPayoffLate(V57_SCENES, 1).ok).toBe(false);
    expect(checkPayoffLate(V57_SCENES, V57_PAYOFF_INDEX).ok).toBe(true);
  });
});

describe("V57 holds the format's STRUCTURE while breaking its SURFACE", () => {
  it("runs in the band all three predecessors ran in", () => {
    // 🔴 Duration is retired as a lever (V54: runtime moved 87%, Instagram
    //    average watch moved 3,289 ms → 3,069 ms). Holding the band keeps the
    //    surface change from being confounded with length.
    const seconds = totalFrames(V57_SCENES) / 30;
    expect(seconds).toBeGreaterThan(14);
    expect(seconds).toBeLessThan(18);
  });

  it("is a different length from ALL THREE predecessors — duration is a duplicate signal", () => {
    for (const scenes of [V50_SCENES, V55_SCENES, V56_SCENES]) {
      expect(totalFrames(V57_SCENES)).not.toBe(totalFrames(scenes));
    }
  });

  it("holds the same beat count and payoff position as all three predecessors", () => {
    for (const scenes of [V50_SCENES, V55_SCENES, V56_SCENES]) {
      expect(V57_SCENES.length).toBe(scenes.length);
    }
    expect(V57_PAYOFF_INDEX).toBe(4);
    expect(V57_PAYOFF_INDEX).toBe(V50_PAYOFF_INDEX);
    expect(V57_PAYOFF_INDEX).toBe(V55_PAYOFF_INDEX);
    expect(V57_PAYOFF_INDEX).toBe(V56_PAYOFF_INDEX);
  });

  it("holds longer per beat than the kinetic format can", () => {
    for (const s of V57_SCENES) expect(sec(s.seconds)).toBeGreaterThan(sec(2.2));
  });

  it("keeps every hold inside the format's own window", () => {
    for (const s of V57_SCENES) {
      expect(sec(s.seconds)).toBeGreaterThanOrEqual(QUIET_SCENE_MIN);
      expect(sec(s.seconds)).toBeLessThanOrEqual(QUIET_SCENE_MAX);
    }
  });

  it("carries one sentence per beat — no kicker, no digit, no table", () => {
    for (const s of V57_SCENES) {
      expect(s.line.trim().split(/\s+/).length).toBeLessThanOrEqual(MAX_WORDS);
      expect(Object.keys(s)).not.toContain("table");
      expect(Object.keys(s)).not.toContain("kicker");
    }
  });
});

describe("V57's ONE variable — the cut is not recognisable as the last cut", () => {
  /**
   * ⭐⭐⭐⭐ THE HYPOTHESIS THESE FOUR ASSERTIONS ENCODE.
   *
   * All three previous quiet cuts opened on `dawn-a` and closed on `ember-b`,
   * and the Instagram skip rate — which measures abandonment inside the first
   * three seconds, i.e. the OPENING FRAME — climbed monotonically with
   * proximity to the previous cut: V50 0.474 (no predecessor), V55 0.571 (four
   * days later), V56 0.706 (ONE day later). The documented control is V43/V44,
   * two consecutive cuts on 99.5% identical opening pixels where V44's
   * one-second hold halved.
   *
   * ⛔ These four assertions are ONE claim, not four preferences. Do not
   * "restore" `dawn-a` to frame 0 to make the family tidier — that is the
   * variable under test.
   */

  it("does NOT open on dawn-a, breaking a three-cut streak", () => {
    for (const scenes of [V50_SCENES, V55_SCENES, V56_SCENES]) expect(scenes[0].bg).toBe("dawn-a");
    expect(V57_SCENES[0].bg).not.toBe("dawn-a");
  });

  it("does NOT close on ember-b, breaking the same streak at the other end", () => {
    for (const scenes of [V50_SCENES, V55_SCENES, V56_SCENES]) {
      expect(scenes[scenes.length - 1].bg).toBe("ember-b");
    }
    expect(V57_SCENES[V57_SCENES.length - 1].bg).not.toBe("ember-b");
  });

  it("shares NO ground at all with V56, the cut one day older", () => {
    // ⭐ Stronger than V56's own gate, which bound only the interior. Distance
    //    in TIME is the active ingredient, and V56 is the neighbour.
    const v56 = new Set(V56_SCENES.map((s) => s.bg));
    for (const s of V57_SCENES) expect(v56.has(s.bg)).toBe(false);
  });

  it("POSITIVE CONTROL: the V56 gate fires if any ground is reused", () => {
    // Without this, the assertion above would pass just as happily against a
    // cut that shares nothing because it shares nothing with anything.
    const mutant = V57_SCENES.map((s, i) => (i === 2 ? { ...s, bg: V56_SCENES[2].bg } : s));
    const v56 = new Set(V56_SCENES.map((s) => s.bg));
    expect(mutant.filter((s) => v56.has(s.bg)).length).toBeGreaterThan(0);
  });

  it("puts its payoff on a ground NO predecessor has ever used", () => {
    // The account's four most important frames must not share pixels.
    const spent = new Set([...V50_SCENES, ...V55_SCENES, ...V56_SCENES].map((s) => s.bg));
    expect(spent.has(V57_SCENES[V57_PAYOFF_INDEX].bg)).toBe(false);
  });

  it("pairs the light scrim only with grounds that are already dark", () => {
    // 🪤 Measured, not reasoned: every scrim darkens DOWNWARD, so the heavy one
    //    exists for the pale ground and the light one for grounds that would
    //    otherwise be thrown away. `dawn-a` is gone, so nothing here is heavy.
    const ALREADY_DARK = /^(night|violet|ember|water)-/;
    for (const s of V57_SCENES) {
      if (s.scrim === "light") expect(s.bg).toMatch(ALREADY_DARK);
      expect(s.scrim).not.toBe("heavy");
    }
  });
});

describe("V57 claims nothing a commenter could contradict", () => {
  /**
   * ⭐⭐⭐ ASSERT THE NEGATIVE. A grep for a phrase that is PRESENT can never
   * detect one that was REMOVED — and the failure mode is a later edit quietly
   * reintroducing a number to "make it more numerology".
   */
  const allText = V57_SCENES.flatMap((s) => [s.line, s.under ?? ""]).join(" ");

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
    const mutant = [...V57_SCENES.map((s) => s.line), "born on the 6th"].join(" ");
    expect(mutant).toMatch(/\d/);
  });

  it("promises a conversation, not a forecast", () => {
    const payoff = V57_SCENES[V57_PAYOFF_INDEX];
    expect(payoff.under).toContain("chart says");
    expect(allText.toLowerCase()).not.toContain("will happen");
  });
});

describe("V57 is a NEW idea, and it refuses without reusing the refusal's words", () => {
  it("shares no line with any predecessor", () => {
    // ⭐ STANDING RULE: never reuse a published content idea.
    const spent = new Set([...V50_SCENES, ...V55_SCENES, ...V56_SCENES].map((s) => s.line));
    for (const s of V57_SCENES) expect(spent.has(s.line)).toBe(false);
  });

  it("shares no UNDER line with any predecessor, except the format's signature", () => {
    const SIGNATURE = "they'll know why · @numevix";
    const spent = new Set(
      [...V50_SCENES, ...V55_SCENES, ...V56_SCENES]
        .map((s) => s.under ?? "")
        .filter((u) => u && u !== SIGNATURE),
    );
    for (const s of V57_SCENES) {
      if (!s.under || s.under === SIGNATURE) continue;
      expect(spent.has(s.under)).toBe(false);
    }
  });

  it("does not echo V55's opener, the nearest neighbour in phrasing", () => {
    // 🪤 "You already know…" was V55's frame 0. An opener that merely rhymes
    //    with it would defeat the point of changing the cover at all.
    expect(V57_SCENES[0].line.toLowerCase()).not.toContain("you already know");
  });

  it("KEEPS the refusal — consolation is 0-for-4 on this account", () => {
    // ⭐ The mechanism is the format's contract (V34, V35, V37, V38 all consoled
    //    and all failed). What V57 changes is the WORDING, not the refusal.
    const payoff = V57_SCENES[V57_PAYOFF_INDEX].line.toLowerCase();
    expect(payoff).toMatch(/^i (?:won't|will not|am not going to|'m not going to)\b/);
  });

  it("BREAKS the refusal's three-cut construction", () => {
    // 🔴 V50/V55/V56 all opened this beat with "I won't tell you" / "I'm not
    //    going to tell you". A fourth identical opener is the same learned
    //    surface as a fourth identical cover frame.
    const TELL_YOU = /^i(?: won't|'m not going to| am not going to) tell you\b/;
    for (const scenes of [V50_SCENES, V55_SCENES, V56_SCENES]) {
      expect(scenes[4].line.toLowerCase()).toMatch(TELL_YOU);
    }
    expect(V57_SCENES[V57_PAYOFF_INDEX].line.toLowerCase()).not.toMatch(TELL_YOU);
  });

  it("POSITIVE CONTROL: the refusal check rejects a consoling payoff", () => {
    const REFUSAL = /^i (?:won't|will not|am not going to|'m not going to)\b/;
    expect("it's going to be fine, i promise.").not.toMatch(REFUSAL);
    expect("this time really will be different.").not.toMatch(REFUSAL);
  });

  it("never states the recurrence as the viewer's fault", () => {
    // ⚠️ WOUND, NOT ACCUSATION — and this subject's accusation is the obvious
    //    version of it. Every line states the recurrence as an event.
    const allText = V57_SCENES.flatMap((s) => [s.line, s.under ?? ""])
      .join(" ")
      .toLowerCase();
    for (const blame of [
      "common denominator",
      "you keep choosing",
      "your own fault",
      "you let it",
      "you allow",
    ]) {
      expect(allText).not.toContain(blame);
    }
  });
});
