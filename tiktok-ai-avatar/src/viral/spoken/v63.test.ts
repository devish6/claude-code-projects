import { describe, expect, it } from "vitest";

import { groundLuma } from "../quiet/scenes";
import {
  MIN_FIRST_PAGE_WORDS,
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
  pageWords,
  polarityCrossings,
  runSpokenGates,
  sceneFrames,
  scenePageCaptions,
  totalFrames,
} from "./scenes";
import { V61_SCENES } from "./v61-read-the-letters";
import { V62_SCENES } from "./v62-four-seconds";
import { V63_PAYOFF_INDEX, V63_SCENES } from "./v63-laughed-first";

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
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in V61 and V62. Each assertion
 * on the real scenes is paired with a mutant that must FAIL, so a gate that
 * silently stopped working turns this file red rather than passing vacuously.
 */
describe("V63 — the spoken format's gates fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runSpokenGates(V63_SCENES, V63_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("would notice adjacent scenes sharing a ground", () => {
    expect(checkGroundChanges(V63_SCENES).ok).toBe(true);
    const broken = V63_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V63_SCENES[0].bg } : s));
    expect(checkGroundChanges(broken).ok).toBe(false);
  });

  it("would notice a hold outside the format's floor and ceiling", () => {
    expect(checkHoldDurations(V63_SCENES).ok).toBe(true);
    const long = V63_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: `${s.text} ${s.text} ${s.text} ${s.text}` } : s,
    );
    expect(checkHoldDurations(long).ok).toBe(false);
  });

  it("would notice a dissolve that does not fit its scene", () => {
    expect(checkDissolveFits(V63_SCENES).ok).toBe(true);
    const tiny: SpokenScene[] = [{ ...V63_SCENES[0], text: "Hi" }];
    expect(checkDissolveFits(tiny).ok).toBe(false);
  });

  it("would notice pages that do not tile their own scene", () => {
    expect(checkPagesTileScene(V63_SCENES).ok).toBe(true);
    const broken = V63_SCENES.map((s, i) => (i === 0 ? { ...s, text: "" } : s));
    expect(checkPagesTileScene(broken).ok).toBe(false);
  });

  it("would notice a single-word page creeping in", () => {
    expect(checkPageRegister(V63_SCENES).ok).toBe(true);
    const alone: SpokenScene[] = [{ ...V63_SCENES[2], text: "Easy-going." }];
    expect(checkPageRegister(alone).ok).toBe(false);
  });

  it("would notice a poster frame carrying only a fragment", () => {
    expect(checkFirstPageComplete(V63_SCENES).ok).toBe(true);
    const short = V63_SCENES.map((s, i) => (i === 0 ? { ...s, text: "You laughed." } : s));
    expect(checkFirstPageComplete(short).ok).toBe(false);
    const fragment = V63_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: "You laughed first so nobody" } : s,
    );
    expect(checkFirstPageComplete(fragment).ok).toBe(false);
  });

  /**
   * 🔴🔴 THE GATE THAT CAUGHT V61'S PAYOFF INVERSION. The mutant here is this
   * cut's own worst case: drop the full stop and the refusal can split, leaving
   * "stop doing it." alone on screen — which is the instruction the payoff
   * exists to refuse, stated as a command.
   */
  it("would notice a page that ends mid-sentence", () => {
    expect(checkPagesAreWholeSentences(V63_SCENES).ok).toBe(true);
    const broken = V63_SCENES.map((s, i) =>
      i === V63_PAYOFF_INDEX ? { ...s, text: "I won't tell you to stop doing it" } : s,
    );
    expect(checkPagesAreWholeSentences(broken).ok).toBe(false);
  });

  it("would notice a page too large for the safe box", () => {
    expect(checkPageFits(V63_SCENES).ok).toBe(true);
    const broken = V63_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: `${"unpronounceablewordthatcannotfit".repeat(2)} and more` } : s,
    );
    expect(checkPageFits(broken).ok).toBe(false);
  });

  it("would notice an accent that vanishes into its own ink", () => {
    expect(checkAccentContrast(V63_SCENES).ok).toBe(true);
    const broken = V63_SCENES.map((s, i) => (i === 0 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(broken).ok).toBe(false);
  });

  /**
   * 🪤 THE BINDING CONSTRAINT IS THE BRIGHTEST BAND, NOT THE MEAN — `lamp-i` is
   * the plate that taught this repo that, so the turn is the scene worth a
   * control of its own.
   */
  it("would notice ink or an accent that cannot be read on its plate", () => {
    expect(checkTextContrast(V63_SCENES).ok).toBe(true);
    const darkInk = V63_SCENES.map((s, i) => (i === 3 ? { ...s, fg: "#1C1712" } : s));
    expect(checkTextContrast(darkInk).ok).toBe(false);
    const paleGround = V63_SCENES.map((s, i) => (i === 0 ? { ...s, bg: "chalk-g" } : s));
    expect(checkTextContrast(paleGround).ok).toBe(false);
  });

  it("would notice a per-scene scrim, which flattens the ladder by construction", () => {
    expect(checkConstantScrim(V63_SCENES).ok).toBe(true);
    const broken = V63_SCENES.map((s, i) => (i === 0 ? { ...s, scrim: "heavy" as const } : s));
    expect(checkConstantScrim(broken).ok).toBe(false);
  });

  it("would notice an ink polarity change, which it cannot render", () => {
    expect(checkSingleInkPolarity(V63_SCENES).ok).toBe(true);
    const broken = V63_SCENES.map((s, i) => (i === 3 ? { ...s, fg: "#1C1712" } : s));
    expect(checkSingleInkPolarity(broken).ok).toBe(false);
  });

  it("would notice a payoff that lands too early", () => {
    expect(checkPayoffLate(V63_SCENES, V63_PAYOFF_INDEX).ok).toBe(true);
    expect(checkPayoffLate(V63_SCENES, 1).ok).toBe(false);
  });

  it("holds every derived scene inside the format's floor and ceiling", () => {
    for (const s of V63_SCENES) {
      expect(sceneFrames(s)).toBeGreaterThanOrEqual(SPOKEN_SCENE_MIN);
      expect(sceneFrames(s)).toBeLessThanOrEqual(SPOKEN_SCENE_MAX);
    }
  });
});

/**
 * 🔴🔴 THIS CUT IS THE NO-NUMBER CONTROL, AND THAT IS ASSERTED AS A NEGATIVE.
 *
 * V62 is the moolank-inside-spoken arm and was hours old when this was written.
 * If a number leaks into V63 there is nothing left to compare V62 against, and
 * the leak would be invisible — a grep for a digit that is PRESENT can never
 * detect one that was supposed to be absent. So the ban lives here, with a
 * positive control proving the check can fail.
 */
describe("V63 — what this cut refuses to carry", () => {
  const prose = (scenes: SpokenScene[]) =>
    scenes
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();

  it("carries no digit in any beat", () => {
    for (const s of V63_SCENES) expect(s.text).not.toMatch(/\d/);
  });

  it("names no birth date, planet, moolank or friendship term", () => {
    const FORBIDDEN = [
      "moolank",
      "birth",
      "born",
      "number",
      "planet",
      "ketu",
      "mercury",
      "venus",
      "saturn",
      "rahu",
      "mars",
      "friend",
      "enemy",
      "neutral",
      "match",
      "compatib",
      "chart",
    ];
    for (const word of FORBIDDEN) expect(prose(V63_SCENES)).not.toContain(word);
  });

  /** The control: the beat V62 carries, dropped into this cut, must be caught. */
  it("would fail if V62's turn were pasted in", () => {
    const violating = V63_SCENES.map((s, i) =>
      i === 3 ? { ...s, text: "Born on the 7th, the 16th or the 25th." } : s,
    );
    expect(violating.some((s) => /\d/.test(s.text))).toBe(true);
    expect(prose(violating)).toContain("born");
  });
});

describe("V63 — what this cut commits to", () => {
  /**
   * ⭐⭐⭐ THE READING THIS CUT TESTS: every cut in the 615-653 band puts the
   * viewer in a MOMENT WITH A WITNESS; both failures (V56 154, V60 168) describe
   * a standing role with nobody else in the frame. Frame 0 must therefore put a
   * second party on screen, and it must do it in the poster frame, not later.
   */
  it("puts a second party in the poster frame", () => {
    expect(V63_SCENES[0].text.toLowerCase()).toContain("nobody else");
    const [firstPage] = scenePageCaptions(V63_SCENES[0]);
    expect(pageWords(firstPage)).toBeGreaterThanOrEqual(MIN_FIRST_PAGE_WORDS);
  });

  /**
   * 🔴 TWO POSTS IN A ROW MAY NOT OPEN ON THE SAME FRAME (V43 → V44: 1s hold
   * halved). V62 is the immediate predecessor; V61 the one before it — and V61
   * is the account's biggest post, so re-serving its poster frame is the V38
   * near-clone shape even though the letter of the rule would allow it.
   */
  it("opens on a plate and a line neither V62 nor V61 used", () => {
    expect(V63_SCENES[0].bg).not.toBe(V62_SCENES[0].bg);
    expect(V63_SCENES[0].bg).not.toBe(V61_SCENES[0].bg);
    expect(V63_SCENES[0].text).not.toBe(V62_SCENES[0].text);
    expect(V63_SCENES[0].bg).toBe("envelope-j");
  });

  /** ⛔ No plate of V62's six, so two consecutive spoken cuts share no world. */
  it("reuses measured plates but none of V62's", () => {
    const v62 = new Set(V62_SCENES.map((s) => s.bg));
    for (const s of V63_SCENES) expect(v62.has(s.bg)).toBe(false);
  });

  /**
   * ⭐ V61's plates, but not in V61's slots — the ladder is a different shape.
   *
   * 🪤 THE LAST TWO SLOTS COINCIDE ON PURPOSE AND MUST BE ALLOWED TO. A spoken
   * cut's TAIL is the format, not the content: the payoff is the floor of the
   * ladder (V61 fan-m 44, V62 water-a 19.3) and the ask is the lift off it (V61
   * doorway-n 58, V62 stone-a 26.9). Within one plate set the darkest plate and
   * the lift above it are therefore fixed, and an assertion that every slot must
   * differ forbids the format's own shape rather than catching a copy — this
   * test was written that way first and was wrong, not the cut.
   *
   * ⇒ What must differ is the HEAD: indices 0-3 carry the argument, and none of
   * them may sit where V61 put them.
   */
  it("re-slots V61's plates rather than replaying its ladder", () => {
    const v61 = V61_SCENES.map((s) => s.bg);
    const v63 = V63_SCENES.map((s) => s.bg);
    expect(new Set(v63)).toEqual(new Set(v61));
    expect(v63).not.toEqual(v61);

    // The head carries the argument: every one of those four moved.
    for (let i = 0; i < V63_PAYOFF_INDEX; i++) expect(v63[i]).not.toBe(v61[i]);

    // The tail is the format: floor, then lift, in that order, in both cuts.
    const shared = v63.filter((bg, i) => bg === v61[i]);
    expect(shared).toEqual(["fan-m", "doorway-n"]);
    expect(v63.indexOf("fan-m")).toBe(V63_PAYOFF_INDEX);
    expect(luma("fan-m")).toBeLessThan(luma("doorway-n"));

    // The control: a straight replay of V61's ladder must fail the head check.
    const replayed = v61.filter((bg, i) => i < V63_PAYOFF_INDEX && bg === v61[i]);
    expect(replayed.length).toBe(V63_PAYOFF_INDEX);
  });

  /** The turn is the brightest plate in the cut, which is why it reads as a lift. */
  it("spikes the ladder at the turn instead of descending monotonically", () => {
    const ladder = V63_SCENES.map((s) => luma(s.bg));
    const turn = ladder[3];
    expect(Math.max(...ladder)).toBe(turn);
    expect(turn).toBeGreaterThan(ladder[2]);
    expect(ladder[4]).toBeLessThan(ladder[3]);
  });

  /** 🔴 DURATION MUST KEEP VARYING — a fixed length once read as repeated content. */
  it("runs a different length from either cut before it", () => {
    expect(totalFrames(V63_SCENES)).not.toBe(totalFrames(V62_SCENES));
    expect(totalFrames(V63_SCENES)).not.toBe(totalFrames(V61_SCENES));
  });

  it("keeps one ink polarity, cream throughout", () => {
    expect(polarityCrossings(V63_SCENES)).toEqual([]);
  });
});
