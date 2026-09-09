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
import { GROUND_BANDS } from "./ground-bands";
import { V50_SCENES } from "./v50-two-am";
import { V55_SCENES } from "./v55-already-know";
import { V56_SCENES } from "./v56-everyone-comes-to-you";
import { V57_SCENES } from "./v57-seen-this-ending";
import { V58_SCENES } from "./v58-who-you-used-to-be";
import { V59_PAYOFF_INDEX, V59_SCENES } from "./v59-made-your-peace";

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in the five tests before it.
 * A guard that cannot fail is worse than none: `expect(ok)` on the real scenes
 * proves only that today's scenes pass, never that the gate would notice if
 * they stopped. Each assertion below is paired with a mutant that must FAIL.
 */
describe("V59 — the quiet format's gates fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runQuietGates(V59_SCENES, V59_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("would notice adjacent scenes sharing a ground", () => {
    expect(checkGroundChanges(V59_SCENES).ok).toBe(true);
    const broken = V59_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V59_SCENES[0].bg } : s));
    expect(checkGroundChanges(broken).ok).toBe(false);
  });

  it("would notice an accent word missing from its own line", () => {
    expect(checkAccentWords(V59_SCENES).ok).toBe(true);
    const broken = V59_SCENES.map((s, i) => (i === 0 ? { ...s, accentWord: "absent" } : s));
    expect(checkAccentWords(broken).ok).toBe(false);
  });

  it("would notice an accent that vanishes into its own ink", () => {
    expect(checkAccentContrast(V59_SCENES).ok).toBe(true);
    const broken = V59_SCENES.map((s, i) => (i === 0 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(broken).ok).toBe(false);
  });

  it("would notice an over-long line", () => {
    expect(checkLineLength(V59_SCENES).ok).toBe(true);
    const broken = V59_SCENES.map((s, i) =>
      i === 0 ? { ...s, line: Array(MAX_WORDS + 1).fill("word").join(" ") } : s,
    );
    expect(checkLineLength(broken).ok).toBe(false);
  });

  it("would notice a payoff that lands too early", () => {
    expect(checkPayoffLate(V59_SCENES, V59_PAYOFF_INDEX).ok).toBe(true);
    expect(checkPayoffLate(V59_SCENES, 1).ok).toBe(false);
  });

  it("holds every scene inside the quiet format's floor and ceiling", () => {
    for (const s of V59_SCENES) {
      // 🪤 QUIET_SCENE_MIN/MAX are FRAMES; `seconds` is seconds. Convert.
      expect(sec(s.seconds)).toBeGreaterThanOrEqual(QUIET_SCENE_MIN);
      expect(sec(s.seconds)).toBeLessThanOrEqual(QUIET_SCENE_MAX);
    }
  });
});

/**
 * ⭐⭐⭐⭐ THIS CUT IS A REPLICATION, AND THE REPLICATION IS WHAT THESE ASSERT.
 *
 * V58 changed the opening surface and returned the best skip of all 65 posts
 * (0.393) and the first quiet cut Instagram actually distributed (213 views,
 * inside the kinetic band, against 34-52 for the four before it). That is ONE
 * POINT. If someone later "tidies" V59's opener onto a plate V58 already used,
 * or back onto a library plate, the replication is silently cancelled and
 * nothing else in the suite would notice.
 */
describe("V59 — the opening frame repeats V58's PROPERTIES, never its pixels", () => {
  const SEEN = new Set(
    [...V50_SCENES, ...V55_SCENES, ...V56_SCENES, ...V57_SCENES, ...V58_SCENES].map((s) => s.bg),
  );

  it("opens on a ground no previous cut has ever used, V58 included", () => {
    expect(SEEN.has(V59_SCENES[0].bg)).toBe(false);
    expect(V59_SCENES[0].bg).toBe("chalk-g");
  });

  /**
   * ⭐⭐⭐⭐ THE OPENER MUST BE AT LEAST AS BRIGHT AND AT LEAST AS FLAT AS
   * V58'S, because those are the two properties under replication. Brightness
   * alone is not enough: `checkTextContrast` clears the WORST band, so a bright
   * plate that decays steeply can still lose the accent in its bottom row —
   * which is exactly what `dawn-a` did at 111.6 mean with a 92-point span.
   */
  const luma = (bg: string) => {
    const L = GROUND_BANDS[bg].map(([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b);
    return { mean: L.reduce((a, b) => a + b, 0) / L.length, span: Math.max(...L) - Math.min(...L) };
  };

  it("opens brighter and flatter than V58 did", () => {
    const v59 = luma(V59_SCENES[0].bg);
    const v58 = luma(V58_SCENES[0].bg);
    expect(v59.mean).toBeGreaterThan(v58.mean);
    expect(v59.span).toBeLessThan(v58.span);
    // And decisively clear of the plate the four failed cuts opened on.
    expect(v59.mean).toBeGreaterThan(luma("dawn-a").mean + 100);
  });

  /**
   * 🪤 SKIP MEASURES THE FIRST THREE SECONDS, so novelty is only worth buying
   * inside them. Scene 1 runs 0.0-2.9s; scene 2 starts at 2.9s. Everything from
   * scene 3 on is reused from V58 ON PURPOSE — asserted here so a later reader
   * does not "fix" the reuse and spend four plates buying nothing measurable.
   */
  it("spends its new plates inside the skip window and reuses the rest deliberately", () => {
    const fresh = V59_SCENES.map((s) => s.bg).filter((bg) => !SEEN.has(bg));
    expect(fresh).toEqual(["chalk-g", "curtain-h"]);

    const reused = V59_SCENES.slice(2).map((s) => s.bg);
    expect(reused).toEqual(["plaster-c", "stone-d", "fold-e", "threshold-f"]);

    const skipWindowEnd = 3.0;
    expect(V59_SCENES[0].seconds).toBeGreaterThan(skipWindowEnd - 0.2);
  });

  it("carries dark ink on the light plates, because the scrim is not doing that job", () => {
    const dark = V59_SCENES.filter(isDarkInk);
    expect(dark.map((s) => s.bg)).toEqual(["chalk-g", "curtain-h", "plaster-c"]);
    expect(checkTextContrast(V59_SCENES).ok).toBe(true);
  });

  /**
   * ⭐⭐⭐⭐ ONE SCRIM FOR THE WHOLE CUT. A per-scene scrim applied to a luma
   * ladder is a ladder-flattening operation BY CONSTRUCTION — it darkens
   * exactly the plates whose brightness was the point. V58's first render
   * proved it, flattening a designed span to 35 and inverting the middle.
   */
  it("darkens every scene by the same amount, so the scrim cannot flatten the ladder", () => {
    expect(new Set(V59_SCENES.map((s) => s.scrim))).toEqual(new Set(["light"]));
  });

  it("descends the whole way and lifts once, at the threshold", () => {
    const ladder = V59_SCENES.map((s) => groundLuma(s.bg, s.scrim) as number);
    const steps = ladder.slice(1).map((v, i) => v - ladder[i]);
    expect(steps.slice(0, 4).every((d) => d < -8)).toBe(true);
    expect(steps[4]).toBeGreaterThan(5);
    expect(V59_SCENES[V59_PAYOFF_INDEX].bg).toBe("fold-e");
  });

  it("changes ink once, on the dissolve into stone-d", () => {
    expect(polarityCrossings(V59_SCENES)).toEqual([2]);
    expect(V59_SCENES[3].bg).toBe("stone-d");
    expect(checkInkPolarityHandoff(V59_SCENES).ok).toBe(true);
  });

  /**
   * ⭐⭐⭐ THE REFUSAL IS THE BEAT, AND IT IS NOT A FORECAST.
   *
   * Every winner in this format declines the consolation its theme invites;
   * V34/V35/V37/V38 offered one and died. Here the lie is "it stops". The
   * under-line has to describe the PRESENT cycle and promise no future one —
   * "what you're standing in", never "when it lifts" — because the ETHICS_BLOCK
   * shipped to production the same day forbids promising an outcome or a date.
   */
  it("refuses the consolation without promising anything in its place", () => {
    const payoff = V59_SCENES[V59_PAYOFF_INDEX];
    expect(payoff.line.toLowerCase()).toContain("won't tell you");
    for (const promise of ["will pass", "gets better", "gets easier", "it lifts", "heals", "one day"]) {
      expect(payoff.under?.toLowerCase()).not.toContain(promise);
    }
  });

  /**
   * ⭐ EVERY SHIPPED CTA NAMES A FELLOW SUFFERER, NEVER A RESCUER. A rescuer
   * offers recognition one beat after the refusal and undercuts it.
   */
  it("asks the viewer to send it to someone with the same wound", () => {
    const ask = V59_SCENES[V59_SCENES.length - 1];
    expect(ask.line.toLowerCase()).toContain("send this to");
    expect(ask.under).toContain("@numevix");
  });
});
