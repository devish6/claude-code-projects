import { describe, expect, it } from "vitest";
import { sec } from "../timing";
import {
  MAX_WORDS,
  checkInkPolarityHandoff,
  checkTextContrast,
  groundLuma,
  isDarkInk,
  polarityCrossings,
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

  /**
   * ⭐⭐⭐⭐ THE RULE THAT USED TO BE HERE SAID THE OPPOSITE, AND THE RENDER
   * PROVED IT WRONG.
   *
   * It asserted cream ink and the `heavy` scrim on the opener, citing a repo
   * measurement that dark ink decays to 1.4:1 down the block. That measurement
   * was taken on `dawn-a` — 115 luma — under the HEAVIEST scrim, which darkens
   * a pale ground until it is no longer pale. It was true of that frame and
   * false as a rule. `glass-a` is 175 full-frame, and under the `light` scrim
   * dark ink measures 9.14 / 7.54 / 6.21 / 5.73 down the block: nothing decays.
   *
   * ⛔ The cost of the old rule was the cut's whole arc. Cream on a light plate
   * NEEDS the heavy scrim, the heavy scrim kept only 39% of the bright plates
   * against 90% of the dark ones, and the descent inverted in the middle.
   */
  it("carries dark ink on the light plates, because the scrim is no longer doing that job", () => {
    const dark = V58_SCENES.filter(isDarkInk);
    expect(dark.map((s) => s.bg)).toEqual(["glass-a", "linen-b", "plaster-c"]);
    expect(checkTextContrast(V58_SCENES).ok).toBe(true);
  });

  /**
   * ⭐⭐⭐⭐ ONE SCRIM FOR THE WHOLE CUT — THE FIX, AS AN ASSERTION.
   *
   * A per-scene scrim is a legibility fix applied one scene at a time, and
   * applied to a luma ladder it is a ladder-flattening operation BY
   * CONSTRUCTION: it darkens exactly the plates whose brightness was the point.
   * A constant scrim cannot flatten anything. If someone reaches for a heavier
   * scrim on a bright plate again, this fails before the render does.
   */
  it("darkens every scene by the same amount, so the scrim cannot flatten the ladder", () => {
    expect(new Set(V58_SCENES.map((s) => s.scrim))).toEqual(new Set(["light"]));
  });

  /**
   * ⭐⭐⭐ THE LADDER IS THE DRAMA, SO IT IS A TEST AND NOT A COMMENT. Measured
   * off the plates and the scrim the renderer actually draws: a monotonic
   * descent through the wound, then a small lift back for the ask.
   */
  it("descends the whole way and lifts once, at the threshold", () => {
    const ladder = V58_SCENES.map((s) => groundLuma(s.bg, s.scrim) as number);
    const steps = ladder.slice(1).map((v, i) => v - ladder[i]);
    expect(steps.slice(0, 4).every((d) => d < -8)).toBe(true);
    expect(steps[4]).toBeGreaterThan(5);
    expect(V58_SCENES[V58_PAYOFF_INDEX].bg).toBe("fold-e");
  });

  /**
   * 🪤 THE INK FLIPS EXACTLY ONCE, AND WHERE THE GROUND CAN CARRY THE GAP.
   * Codex called the boundary provisional and asked for it to be measured. It
   * was: `plaster-c` at 120 luma is the mid-tone, and no accent colour clears
   * 3.0:1 there on either side — gold reads 2.28, rust 2.34. So the flip moved
   * one scene later, onto the 120 -> 87 step, where both grounds are still
   * plainly photographs and every accent reads.
   */
  it("changes ink once, on the dissolve into stone-d", () => {
    expect(polarityCrossings(V58_SCENES)).toEqual([2]);
    expect(V58_SCENES[3].bg).toBe("stone-d");
    expect(checkInkPolarityHandoff(V58_SCENES).ok).toBe(true);
  });
});
