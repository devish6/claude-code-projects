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
} from "./scenes";
import { V50_SCENES } from "./v50-two-am";
import { V55_SCENES } from "./v55-already-know";
import { V56_SCENES } from "./v56-everyone-comes-to-you";
import { V57_SCENES } from "./v57-seen-this-ending";
import { V58_PAYOFF_INDEX, V58_SCENES } from "./v58-who-you-used-to-be";

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in the four tests before it.
 * A guard that cannot fail is worse than none: `expect(ok)` on the real scenes
 * proves only that today's scenes pass, never that the gate would notice if
 * they stopped. Each assertion below is paired with a mutant that must FAIL.
 */
describe("V58 — the quiet format's gates fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runQuietGates(V58_SCENES, V58_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("would notice adjacent scenes sharing a ground", () => {
    expect(checkGroundChanges(V58_SCENES).ok).toBe(true);
    const broken = V58_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V58_SCENES[0].bg } : s));
    expect(checkGroundChanges(broken).ok).toBe(false);
  });

  it("would notice an accent word missing from its own line", () => {
    expect(checkAccentWords(V58_SCENES).ok).toBe(true);
    const broken = V58_SCENES.map((s, i) => (i === 0 ? { ...s, accentWord: "absent" } : s));
    expect(checkAccentWords(broken).ok).toBe(false);
  });

  it("would notice an accent that vanishes into its own ink", () => {
    expect(checkAccentContrast(V58_SCENES).ok).toBe(true);
    const broken = V58_SCENES.map((s, i) => (i === 0 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(broken).ok).toBe(false);
  });

  it("would notice an over-long line", () => {
    expect(checkLineLength(V58_SCENES).ok).toBe(true);
    const broken = V58_SCENES.map((s, i) =>
      i === 0 ? { ...s, line: Array(MAX_WORDS + 1).fill("word").join(" ") } : s,
    );
    expect(checkLineLength(broken).ok).toBe(false);
  });

  it("would notice a payoff that lands too early", () => {
    expect(checkPayoffLate(V58_SCENES, V58_PAYOFF_INDEX).ok).toBe(true);
    expect(checkPayoffLate(V58_SCENES, 1).ok).toBe(false);
  });

  it("holds every scene inside the quiet format's floor and ceiling", () => {
    for (const s of V58_SCENES) {
      // 🪤 QUIET_SCENE_MIN/MAX are FRAMES; `seconds` is seconds. Convert.
      expect(sec(s.seconds)).toBeGreaterThanOrEqual(QUIET_SCENE_MIN);
      expect(sec(s.seconds)).toBeLessThanOrEqual(QUIET_SCENE_MAX);
    }
  });
});

/**
 * ⭐⭐⭐⭐ THE POINT OF THIS CUT, ASSERTED. V50/V55/V56 all opened on `dawn-a`,
 * and skip degraded with proximity to the previous cut. If someone later
 * "tidies" V58 back onto a library plate, the experiment is silently cancelled
 * and nothing else in the suite would notice.
 */
describe("V58 — the opening frame is the variable under test", () => {
  const LIBRARY = new Set(
    [...V50_SCENES, ...V55_SCENES, ...V56_SCENES, ...V57_SCENES].map((s) => s.bg),
  );

  it("opens on a ground no previous cut has ever used", () => {
    expect(LIBRARY.has(V58_SCENES[0].bg)).toBe(false);
    expect(V58_SCENES[0].bg).toBe("glass-a");
  });

  it("uses no library ground anywhere, so no frame is a repeat", () => {
    const reused = V58_SCENES.map((s) => s.bg).filter((bg) => LIBRARY.has(bg));
    expect(reused).toEqual([]);
  });

  it("closes on a ground that is not the old ember-b habit", () => {
    expect(V58_SCENES[V58_SCENES.length - 1].bg).not.toBe("ember-b");
  });

  it("keeps cream ink on the light opener, never dark ink", () => {
    // 🪤 Dark ink on a pale ground fights the downward-darkening scrim and
    //    decays to 1.4:1 by the last line. Measured, not reasoned.
    const first = V58_SCENES[0];
    expect(first.scrim).toBe("heavy");
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(first.fg.slice(i, i + 2), 16));
    expect(Math.min(r, g, b)).toBeGreaterThan(200);
  });
});
