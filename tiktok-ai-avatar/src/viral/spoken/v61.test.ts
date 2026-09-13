import { describe, expect, it } from "vitest";

import { groundLuma, totalFrames as quietTotalFrames } from "../quiet/scenes";
import { V59_SCENES } from "../quiet/v59-made-your-peace";
import { V60_SCENES } from "../quiet/v60-weather-there";
import {
  MIN_FIRST_PAGE_WORDS,
  MIN_PAGE_WORDS,
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
  isDarkInk,
  pageWords,
  polarityCrossings,
  runSpokenGates,
  sceneFrames,
  scenePageCaptions,
  totalFrames,
} from "./scenes";
import { V61_PAYOFF_INDEX, V61_SCENES } from "./v61-read-the-letters";

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in the seven quiet cut tests
 * before it. Each assertion on the real scenes is paired with a mutant that must
 * FAIL, so a gate that silently stopped working turns this file red rather than
 * passing vacuously. This repo has shipped a check that could not fail the way
 * the real operation fails four separate times.
 */
describe("V61 — the spoken format's gates fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runSpokenGates(V61_SCENES, V61_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("would notice adjacent scenes sharing a ground", () => {
    expect(checkGroundChanges(V61_SCENES).ok).toBe(true);
    const broken = V61_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V61_SCENES[0].bg } : s));
    expect(checkGroundChanges(broken).ok).toBe(false);
  });

  it("would notice a hold outside the format's floor and ceiling", () => {
    expect(checkHoldDurations(V61_SCENES).ok).toBe(true);
    // Prose far too long for one ground — the failure that must not be clamped away.
    const broken = V61_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: `${s.text} ${s.text} ${s.text} ${s.text}` } : s,
    );
    expect(checkHoldDurations(broken).ok).toBe(false);
  });

  /**
   * 🪤 `checkHoldDurations` BINDS FIRST in practice — its floor is far above
   * `DISSOLVE * 2`, so no plausible prose reaches this gate. A realistic mutant
   * therefore proves nothing about it (a two-word scene still clears the
   * dissolve threshold once `TAIL` is added, which is how the first version of
   * this test passed while asserting the opposite). The control is a synthetic
   * one-word scene that exercises the gate directly.
   */
  it("would notice a dissolve that does not fit its scene", () => {
    expect(checkDissolveFits(V61_SCENES).ok).toBe(true);
    const tiny: SpokenScene[] = [{ ...V61_SCENES[0], text: "Hi" }];
    expect(checkDissolveFits(tiny).ok).toBe(false);
  });

  it("would notice pages that do not tile their own scene", () => {
    expect(checkPagesTileScene(V61_SCENES).ok).toBe(true);
    const broken = V61_SCENES.map((s, i) => (i === 0 ? { ...s, text: "" } : s));
    expect(checkPagesTileScene(broken).ok).toBe(false);
  });

  /**
   * 🔴 THE REGISTER GATE, AND IT ALREADY EARNED ITS KEEP. Before
   * `mergeShortPages` existed, the time-based pager produced one-word pages on
   * scenes 0, 3 and 4 of this very cut — the `loud` register arriving by
   * accident. The mutant is a scene with no neighbour to merge into.
   */
  it("would notice a single-word page creeping in", () => {
    expect(checkPageRegister(V61_SCENES).ok).toBe(true);
    const alone: SpokenScene[] = [{ ...V61_SCENES[2], text: "Alone." }];
    expect(checkPageRegister(alone).ok).toBe(false);
  });

  it("would notice a poster frame carrying only a fragment", () => {
    expect(checkFirstPageComplete(V61_SCENES).ok).toBe(true);
    // Too few words, though it IS a whole sentence.
    const short = V61_SCENES.map((s, i) => (i === 0 ? { ...s, text: "You were." } : s));
    expect(checkFirstPageComplete(short).ok).toBe(false);
    // 🔴 The one the first render actually shipped: enough words, no terminal
    //    punctuation, so frame 0 read "You were the one who" and trailed off.
    const fragment = V61_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: "You were the one who read the letters" } : s,
    );
    expect(checkFirstPageComplete(fragment).ok).toBe(false);
  });

  /**
   * 🔴🔴 THE GATE THAT WOULD HAVE CAUGHT THE PAYOFF INVERSION. The first render
   * split "I won't tell you it made you who you are." across two pages, leaving
   * "it made you who you are." alone on screen — the exact consolation the cut
   * refuses. Every other gate was green.
   */
  it("would notice a page that ends mid-sentence", () => {
    expect(checkPagesAreWholeSentences(V61_SCENES).ok).toBe(true);
    const broken = V61_SCENES.map((s, i) =>
      i === 4 ? { ...s, text: "I won't tell you it made you who you are" } : s,
    );
    expect(checkPagesAreWholeSentences(broken).ok).toBe(false);
  });

  it("would notice a page too large for the safe box", () => {
    expect(checkPageFits(V61_SCENES).ok).toBe(true);
    const broken = V61_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: `${"unpronounceablewordthatcannotfit".repeat(2)} and more` } : s,
    );
    expect(checkPageFits(broken).ok).toBe(false);
  });

  it("would notice an accent that vanishes into its own ink", () => {
    expect(checkAccentContrast(V61_SCENES).ok).toBe(true);
    const broken = V61_SCENES.map((s, i) => (i === 0 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(broken).ok).toBe(false);
  });

  /**
   * 🔴 Both directions are checked, because the design's first ladder was sized
   * against cream ink alone and the GOLD ACCENT would have failed on it. On a
   * mid-tone ground the accent is the binding constraint, not the ink.
   */
  it("would notice ink or an accent that cannot be read on its plate", () => {
    expect(checkTextContrast(V61_SCENES).ok).toBe(true);
    const darkInk = V61_SCENES.map((s, i) => (i === 5 ? { ...s, fg: "#1C1712" } : s));
    expect(checkTextContrast(darkInk).ok).toBe(false);
    const paleGround = V61_SCENES.map((s, i) => (i === 0 ? { ...s, bg: "chalk-g" } : s));
    expect(checkTextContrast(paleGround).ok).toBe(false);
  });

  it("would notice a per-scene scrim, which flattens the ladder by construction", () => {
    expect(checkConstantScrim(V61_SCENES).ok).toBe(true);
    const broken = V61_SCENES.map((s, i) => (i === 0 ? { ...s, scrim: "heavy" as const } : s));
    expect(checkConstantScrim(broken).ok).toBe(false);
  });

  /**
   * 🔴 This format has NO ink handoff, so a polarity flip would stack dark
   * lettering on cream lettering at the dissolve. Zero crossings, enforced.
   */
  it("would notice an ink polarity change, which it cannot render", () => {
    expect(checkSingleInkPolarity(V61_SCENES).ok).toBe(true);
    const broken = V61_SCENES.map((s, i) => (i === 3 ? { ...s, fg: "#1C1712" } : s));
    expect(checkSingleInkPolarity(broken).ok).toBe(false);
  });

  it("would notice a payoff that lands too early", () => {
    expect(checkPayoffLate(V61_SCENES, V61_PAYOFF_INDEX).ok).toBe(true);
    expect(checkPayoffLate(V61_SCENES, 1).ok).toBe(false);
  });

  it("holds every derived scene inside the format's floor and ceiling", () => {
    for (const s of V61_SCENES) {
      expect(sceneFrames(s)).toBeGreaterThanOrEqual(SPOKEN_SCENE_MIN);
      expect(sceneFrames(s)).toBeLessThanOrEqual(SPOKEN_SCENE_MAX);
    }
  });
});

describe("V61 — what this cut commits to", () => {
  /**
   * 🔴 TWO POSTS IN A ROW MAY NOT OPEN ON THE SAME FRAME (V43 → V44: 99.5%
   * identical frame-0 pixels, 1s hold halved). V60 is the immediate predecessor.
   * Here the plate, the face, the type size and the wording all differ — but the
   * assertion is on the data, not on the intention.
   */
  it("opens on a plate and an opening line V60 never used", () => {
    expect(V61_SCENES[0].bg).not.toBe(V60_SCENES[0].bg);
    expect(V61_SCENES[0].text).not.toBe(V60_SCENES[0].line);
    expect(V61_SCENES[0].bg).toBe("lamp-i");
  });

  /** No plate in this cut may be one the quiet series has already shown. */
  it("uses only grounds no quiet cut has used", () => {
    const used = new Set([...V59_SCENES, ...V60_SCENES].map((s) => s.bg));
    for (const s of V61_SCENES) expect(used.has(s.bg)).toBe(false);
  });

  /**
   * 🔴 DURATION MUST KEEP VARYING. A fixed 17.450667s once made TikTok read the
   * whole set as repeated content, and V59/V60 both ran ~16.6/16.4s.
   */
  it("runs a different length from the two cuts before it", () => {
    expect(totalFrames(V61_SCENES)).not.toBe(quietTotalFrames(V59_SCENES));
    expect(totalFrames(V61_SCENES)).not.toBe(quietTotalFrames(V60_SCENES));
  });

  it("puts no number on screen, so there is no claim to contradict", () => {
    for (const s of V61_SCENES) expect(s.text).not.toMatch(/\d/);
  });

  it("keeps one ink polarity, cream throughout", () => {
    expect(V61_SCENES.every((s) => !isDarkInk(s))).toBe(true);
    expect(polarityCrossings(V61_SCENES)).toEqual([]);
  });

  it("descends at every step to the payoff and lifts once, at the doorway", () => {
    const ladder = V61_SCENES.map((s) => groundLuma(s.bg, s.scrim) as number);
    const steps = ladder.slice(1).map((v, i) => v - ladder[i]);
    expect(steps.slice(0, V61_PAYOFF_INDEX).every((d) => d < 0)).toBe(true);
    expect(steps[V61_PAYOFF_INDEX]).toBeGreaterThan(5);
    expect(V61_SCENES[V61_SCENES.length - 1].bg).toBe("doorway-n");
  });

  /**
   * ⭐⭐⭐ THE REFUSAL IS THE BEAT, AND IT PROMISES NOTHING IN PLACE OF WHAT IT
   * WITHHOLDS. The lie this theme invites is "it made you who you are". The
   * ETHICS_BLOCK forbids promising an outcome, a date or an amount.
   */
  it("refuses the consolation without promising anything in its place", () => {
    const payoff = V61_SCENES[V61_PAYOFF_INDEX];
    expect(payoff.text.toLowerCase()).toContain("won't tell you");
    for (const promise of ["will", "gets better", "works out", "meant to be", "one day", "happen"]) {
      expect(payoff.text.toLowerCase()).not.toContain(promise);
    }
  });

  it("asks for a send to someone with the same history, and bookends frame 0", () => {
    const ask = V61_SCENES[V61_SCENES.length - 1];
    expect(ask.text.toLowerCase()).toContain("send this to");
    expect(ask.text).toContain("letters");
    expect(V61_SCENES[0].text).toContain("letters");
  });

  /**
   * The register, asserted on the real page layout the renderer will use — the
   * same function, not a re-derivation. A gate that cannot be handed its own
   * inputs cannot block anything.
   */
  it("pages into phrases, never into single words", () => {
    for (const s of V61_SCENES) {
      const pages = scenePageCaptions(s);
      expect(pages.length).toBeGreaterThan(0);
      for (const p of pages) expect(pageWords(p)).toBeGreaterThanOrEqual(MIN_PAGE_WORDS);
    }
    expect(pageWords(scenePageCaptions(V61_SCENES[0])[0])).toBeGreaterThanOrEqual(
      MIN_FIRST_PAGE_WORDS,
    );
  });
});
