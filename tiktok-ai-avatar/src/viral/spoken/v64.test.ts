import { describe, expect, it } from "vitest";

import { groundLuma } from "../quiet/scenes";
import {
  SPOKEN_SCENE_MAX,
  SPOKEN_SCENE_MIN,
  type SpokenScene,
  checkAccentContrast,
  checkConstantScrim,
  checkDissolveFits,
  checkFirstPageComplete,
  checkGroundChanges,
  checkHoldDurations,
  checkPageFits,
  checkPageRegister,
  checkPagesAreWholeSentences,
  checkPagesTileScene,
  checkPayoffLate,
  checkSingleInkPolarity,
  checkTextContrast,
  polarityCrossings,
  runSpokenGates,
  sceneFrames,
  totalFrames,
} from "./scenes";
import { V62_SCENES } from "./v62-four-seconds";
import { V63_SCENES } from "./v63-laughed-first";
import { V64_PAYOFF_INDEX, V64_SCENES } from "./v64-thanked-the-wrong-person";

/**
 * `groundLuma` returns null for a plate with no measured bands. Every plate this
 * cut uses is measured, so a null here is a MISSING MEASUREMENT rather than a
 * dark plate — fail loudly instead of letting it coerce to 0 and make a ladder
 * check pass on absent data.
 */
const luma = (bg: string): number => {
  const v = groundLuma(bg, "light");
  if (v === null) throw new Error(`${bg} has no measured bands`);
  return v;
};

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in V61, V62 and V63. Each
 * assertion on the real scenes is paired with a mutant that must FAIL, so a
 * gate that silently stopped working turns this file red rather than passing
 * vacuously.
 */
describe("V64 — the spoken format's gates fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runSpokenGates(V64_SCENES, V64_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("would notice adjacent scenes sharing a ground", () => {
    expect(checkGroundChanges(V64_SCENES).ok).toBe(true);
    const broken = V64_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V64_SCENES[0].bg } : s));
    expect(checkGroundChanges(broken).ok).toBe(false);
  });

  it("would notice a hold outside the format's floor and ceiling", () => {
    expect(checkHoldDurations(V64_SCENES).ok).toBe(true);
    const long = V64_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: `${s.text} ${s.text} ${s.text} ${s.text}` } : s,
    );
    expect(checkHoldDurations(long).ok).toBe(false);
  });

  it("would notice a dissolve that does not fit its scene", () => {
    expect(checkDissolveFits(V64_SCENES).ok).toBe(true);
    const tiny: SpokenScene[] = [{ ...V64_SCENES[0], text: "Hi" }];
    expect(checkDissolveFits(tiny).ok).toBe(false);
  });

  it("would notice pages that do not tile their own scene", () => {
    expect(checkPagesTileScene(V64_SCENES).ok).toBe(true);
    const broken = V64_SCENES.map((s, i) => (i === 0 ? { ...s, text: "" } : s));
    expect(checkPagesTileScene(broken).ok).toBe(false);
  });

  it("would notice a single-word page creeping in", () => {
    expect(checkPageRegister(V64_SCENES).ok).toBe(true);
    const alone: SpokenScene[] = [{ ...V64_SCENES[2], text: "Applause." }];
    expect(checkPageRegister(alone).ok).toBe(false);
  });

  it("would notice a poster frame carrying only a fragment", () => {
    expect(checkFirstPageComplete(V64_SCENES).ok).toBe(true);
    const short = V64_SCENES.map((s, i) => (i === 0 ? { ...s, text: "They thanked." } : s));
    expect(checkFirstPageComplete(short).ok).toBe(false);
    const fragment = V64_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: "They thanked the wrong" } : s,
    );
    expect(checkFirstPageComplete(fragment).ok).toBe(false);
  });

  /**
   * 🔴🔴 THE GATE THAT CAUGHT V61'S PAYOFF INVERSION. The mutant is this cut's
   * own worst case: drop the full stop and the refusal can split, leaving
   * "it evens out later." alone on screen — the exact consolation the payoff
   * exists to refuse, stated as a promise.
   */
  it("would notice a page that ends mid-sentence", () => {
    expect(checkPagesAreWholeSentences(V64_SCENES).ok).toBe(true);
    const broken = V64_SCENES.map((s, i) =>
      i === V64_PAYOFF_INDEX ? { ...s, text: "I won't tell you that it evens out later" } : s,
    );
    expect(checkPagesAreWholeSentences(broken).ok).toBe(false);
  });

  it("would notice a page too large for the safe box", () => {
    expect(checkPageFits(V64_SCENES).ok).toBe(true);
    const broken = V64_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: `${"unpronounceablewordthatcannotfit".repeat(2)} and more` } : s,
    );
    expect(checkPageFits(broken).ok).toBe(false);
  });

  it("would notice an accent that vanishes into its own ink", () => {
    expect(checkAccentContrast(V64_SCENES).ok).toBe(true);
    const broken = V64_SCENES.map((s, i) => (i === 0 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(broken).ok).toBe(false);
  });

  /**
   * 🪤 THE BINDING CONSTRAINT IS THE BRIGHTEST BAND, NOT THE MEAN. `stone-d` is
   * the brightest plate in this cut and carries the turn, so it is the scene
   * that earns a control of its own.
   */
  it("would notice ink or an accent that cannot be read on its plate", () => {
    expect(checkTextContrast(V64_SCENES).ok).toBe(true);
    const darkInk = V64_SCENES.map((s, i) => (i === 3 ? { ...s, fg: "#1C1712" } : s));
    expect(checkTextContrast(darkInk).ok).toBe(false);
    const paleGround = V64_SCENES.map((s, i) => (i === 0 ? { ...s, bg: "chalk-g" } : s));
    expect(checkTextContrast(paleGround).ok).toBe(false);
  });

  it("would notice a per-scene scrim, which flattens the ladder by construction", () => {
    expect(checkConstantScrim(V64_SCENES).ok).toBe(true);
    const broken = V64_SCENES.map((s, i) => (i === 0 ? { ...s, scrim: "heavy" as const } : s));
    expect(checkConstantScrim(broken).ok).toBe(false);
  });

  it("would notice an ink polarity change, which it cannot render", () => {
    expect(checkSingleInkPolarity(V64_SCENES).ok).toBe(true);
    expect(polarityCrossings(V64_SCENES)).toHaveLength(0);
    const broken = V64_SCENES.map((s, i) => (i === 3 ? { ...s, fg: "#1C1712" } : s));
    expect(checkSingleInkPolarity(broken).ok).toBe(false);
  });

  it("would notice a payoff that lands too early", () => {
    expect(checkPayoffLate(V64_SCENES, V64_PAYOFF_INDEX).ok).toBe(true);
    expect(checkPayoffLate(V64_SCENES, 1).ok).toBe(false);
  });

  it("holds every derived scene inside the format's floor and ceiling", () => {
    for (const s of V64_SCENES) {
      expect(sceneFrames(s)).toBeGreaterThanOrEqual(SPOKEN_SCENE_MIN);
      expect(sceneFrames(s)).toBeLessThanOrEqual(SPOKEN_SCENE_MAX);
    }
  });

  it("runs inside the band the other spoken cuts run in", () => {
    const frames = totalFrames(V64_SCENES);
    expect(frames).toBeGreaterThan(600);
    expect(frames).toBeLessThan(800);
  });
});

describe("V64 — the decisions this cut is the ARM for", () => {
  /**
   * ⛔⛔ NO MOOLANK, DELIBERATELY. V62 is the moolank-inside-spoken arm and is
   * the only cut carrying a number; a number here would take that arm from n=1
   * to a muddle. This is a NEGATIVE assertion, so it needs a positive control —
   * without one it would keep passing after the matcher stopped working.
   */
  it("names no birth number anywhere in the cut", () => {
    const hasNumber = (scenes: SpokenScene[]): boolean =>
      scenes.some((s) => /\b(moolank|birth number|born on the|[1-9](st|th|rd|nd)\b)/i.test(s.text));
    expect(hasNumber(V64_SCENES)).toBe(false);
    // positive control: V62 IS the number arm, and the same matcher must see it.
    expect(hasNumber(V62_SCENES)).toBe(true);
  });

  /**
   * ⭐⭐⭐ THE READING THIS CUT TESTS. Every cut in the 615-653 band puts a
   * SECOND PERSON in the opening clause; both floor cuts (154, 168) describe a
   * standing role with nobody else there. Frame 0 must open on the other party.
   */
  it("puts a second person in the poster frame, not a standing role", () => {
    expect(V64_SCENES[0].text).toMatch(/^(They|Someone|Somebody|Nobody|The room)\b/);
  });

  /** ⛔ Consecutive cuts share no world — none of V63's plates may appear. */
  it("reuses none of the grounds of the cut before it", () => {
    const previous = new Set(V63_SCENES.map((s) => s.bg));
    for (const s of V64_SCENES) expect(previous.has(s.bg)).toBe(false);
  });

  /** The turn is the brightest plate, and the refusal is the floor of the cut. */
  it("spikes its luma ladder at the turn and floors it at the refusal", () => {
    const ladder = V64_SCENES.map((s) => luma(s.bg));
    expect(Math.max(...ladder)).toBe(ladder[3]);
    expect(Math.min(...ladder)).toBe(ladder[V64_PAYOFF_INDEX]);
    expect(Math.max(...ladder) - Math.min(...ladder)).toBeGreaterThan(60);
  });

  /**
   * ⭐ THE PAYOFF REFUSES, and refuses something no earlier cut refused. V58
   * refused "they'll catch up", V61 "it made you who you are", V62 "the right
   * ones stay", V63 "stop doing it". This one refuses the ledger.
   */
  it("refuses a consolation and promises no outcome", () => {
    const payoff = V64_SCENES[V64_PAYOFF_INDEX].text;
    expect(payoff).toMatch(/^I won't tell you/);
    expect(payoff).not.toMatch(/\b(will|guarantee|promise|always|never fails)\b/i);
  });
});
