import { describe, expect, it } from "vitest";
import { sec } from "../timing";
import {
  MAX_WORDS,
  QUIET_SCENE_MAX,
  QUIET_SCENE_MIN,
  checkAccentContrast,
  checkAccentWords,
  checkGroundChanges,
  checkInkPolarityHandoff,
  checkLineLength,
  checkPayoffLate,
  checkTextContrast,
  groundLuma,
  isDarkInk,
  polarityCrossings,
  runQuietGates,
  totalFrames,
} from "./scenes";
import { V58_SCENES } from "./v58-who-you-used-to-be";
import { V59_SCENES } from "./v59-made-your-peace";
import { V60_PAYOFF_INDEX, V60_SCENES } from "./v60-weather-there";

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in the six tests before it.
 * Each assertion on the real scenes is paired with a mutant that must FAIL, so
 * a gate that silently stopped working would turn this file red.
 */
describe("V60 — the quiet format's gates fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runQuietGates(V60_SCENES, V60_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("would notice adjacent scenes sharing a ground", () => {
    expect(checkGroundChanges(V60_SCENES).ok).toBe(true);
    const broken = V60_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V60_SCENES[0].bg } : s));
    expect(checkGroundChanges(broken).ok).toBe(false);
  });

  it("would notice an accent word missing from its own line", () => {
    expect(checkAccentWords(V60_SCENES).ok).toBe(true);
    const broken = V60_SCENES.map((s, i) => (i === 0 ? { ...s, accentWord: "absent" } : s));
    expect(checkAccentWords(broken).ok).toBe(false);
  });

  it("would notice an accent that vanishes into its own ink", () => {
    expect(checkAccentContrast(V60_SCENES).ok).toBe(true);
    const broken = V60_SCENES.map((s, i) => (i === 0 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(broken).ok).toBe(false);
  });

  it("would notice ink that cannot be read on its plate", () => {
    expect(checkTextContrast(V60_SCENES).ok).toBe(true);
    // Cream ink on the brightest plate is the failure the gate exists for.
    const broken = V60_SCENES.map((s, i) => (i === 0 ? { ...s, fg: "#F5F0E8" } : s));
    expect(checkTextContrast(broken).ok).toBe(false);
  });

  it("would notice an over-long line", () => {
    expect(checkLineLength(V60_SCENES).ok).toBe(true);
    const broken = V60_SCENES.map((s, i) =>
      i === 0 ? { ...s, line: Array(MAX_WORDS + 1).fill("word").join(" ") } : s,
    );
    expect(checkLineLength(broken).ok).toBe(false);
  });

  it("would notice a payoff that lands too early", () => {
    expect(checkPayoffLate(V60_SCENES, V60_PAYOFF_INDEX).ok).toBe(true);
    expect(checkPayoffLate(V60_SCENES, 1).ok).toBe(false);
  });

  it("holds every scene inside the quiet format's floor and ceiling", () => {
    for (const s of V60_SCENES) {
      // 🪤 QUIET_SCENE_MIN/MAX are FRAMES; `seconds` is seconds. Convert.
      expect(sec(s.seconds)).toBeGreaterThanOrEqual(QUIET_SCENE_MIN);
      expect(sec(s.seconds)).toBeLessThanOrEqual(QUIET_SCENE_MAX);
    }
  });
});

describe("V60 — what this cut commits to", () => {
  /**
   * 🔴 TWO POSTS IN A ROW MAY NOT OPEN ON THE SAME FRAME (V43 → V44: 99.5%
   * identical frame-0 pixels, 1s hold halved). The rule binds the IMMEDIATE
   * predecessor. `glass-a` is V58's opener, two posts back, reused on purpose.
   */
  it("opens on a different plate and a different line from V59", () => {
    expect(V60_SCENES[0].bg).not.toBe(V59_SCENES[0].bg);
    expect(V60_SCENES[0].line).not.toBe(V59_SCENES[0].line);
    expect(V60_SCENES[0].bg).toBe("glass-a");
  });

  /**
   * 🔴 DURATION MUST KEEP VARYING. A fixed 17.450667s once made TikTok read the
   * set as repeated content, and V58 and V59 both ran 16.6s.
   */
  it("runs a different length from the two cuts before it", () => {
    expect(totalFrames(V60_SCENES)).not.toBe(totalFrames(V59_SCENES));
    expect(totalFrames(V60_SCENES)).not.toBe(totalFrames(V58_SCENES));
  });

  it("puts no number on screen, so there is no claim to contradict", () => {
    for (const s of V60_SCENES) {
      expect(s.line).not.toMatch(/\d/);
      expect(s.under ?? "").not.toMatch(/\d/);
    }
  });

  it("darkens every scene by the same amount, so the scrim cannot flatten the ladder", () => {
    expect(new Set(V60_SCENES.map((s) => s.scrim))).toEqual(new Set(["light"]));
  });

  it("descends at every step to the payoff and lifts once, at the doorway", () => {
    const ladder = V60_SCENES.map((s) => groundLuma(s.bg, s.scrim) as number);
    const steps = ladder.slice(1).map((v, i) => v - ladder[i]);
    expect(steps.slice(0, V60_PAYOFF_INDEX).every((d) => d < 0)).toBe(true);
    expect(steps[V60_PAYOFF_INDEX]).toBeGreaterThan(5);
    expect(V60_SCENES[V60_SCENES.length - 1].bg).toBe("threshold-f");
  });

  it("changes ink once, on the dissolve into stone-d", () => {
    expect(V60_SCENES.filter(isDarkInk).map((s) => s.bg)).toEqual(["glass-a", "curtain-h", "linen-b"]);
    expect(polarityCrossings(V60_SCENES)).toEqual([2]);
    expect(checkInkPolarityHandoff(V60_SCENES).ok).toBe(true);
  });

  /**
   * ⭐⭐⭐ THE REFUSAL IS THE BEAT, AND IT IS NOT A FORECAST. The lie this theme
   * invites is "you chose right". The ETHICS_BLOCK forbids promising an
   * outcome, so the under-line may read the present road and nothing more.
   */
  it("refuses the consolation without promising anything in its place", () => {
    const payoff = V60_SCENES[V60_PAYOFF_INDEX];
    expect(payoff.line.toLowerCase()).toContain("won't tell you");
    for (const promise of ["will", "gets better", "works out", "meant to be", "one day", "happen"]) {
      expect(payoff.under?.toLowerCase()).not.toContain(promise);
    }
  });

  it("asks for a send to someone with the same habit, and bookends frame 0", () => {
    const ask = V60_SCENES[V60_SCENES.length - 1];
    expect(ask.line.toLowerCase()).toContain("send this to");
    expect(ask.line).toContain("weather");
    expect(V60_SCENES[0].line).toContain("weather");
    expect(ask.under).toContain("@numevix");
  });
});
