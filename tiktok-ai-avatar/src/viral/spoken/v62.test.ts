import { describe, expect, it } from "vitest";

import { groundLuma } from "../quiet/scenes";
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
import { V62_PAYOFF_INDEX, V62_SCENES } from "./v62-four-seconds";

/**
 * ⭐⭐⭐ EVERY GATE CARRIES A POSITIVE CONTROL, as in V61 and the seven quiet cut
 * tests before it. Each assertion on the real scenes is paired with a mutant
 * that must FAIL, so a gate that silently stopped working turns this file red
 * rather than passing vacuously.
 */
describe("V62 — the spoken format's gates fail on it too", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runSpokenGates(V62_SCENES, V62_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("would notice adjacent scenes sharing a ground", () => {
    expect(checkGroundChanges(V62_SCENES).ok).toBe(true);
    const broken = V62_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V62_SCENES[0].bg } : s));
    expect(checkGroundChanges(broken).ok).toBe(false);
  });

  it("would notice a hold outside the format's floor and ceiling", () => {
    expect(checkHoldDurations(V62_SCENES).ok).toBe(true);
    const broken = V62_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: `${s.text} ${s.text} ${s.text} ${s.text}` } : s,
    );
    expect(checkHoldDurations(broken).ok).toBe(false);
  });

  /** 🪤 `checkHoldDurations` binds first on realistic prose — see V61's note. */
  it("would notice a dissolve that does not fit its scene", () => {
    expect(checkDissolveFits(V62_SCENES).ok).toBe(true);
    const tiny: SpokenScene[] = [{ ...V62_SCENES[0], text: "Hi" }];
    expect(checkDissolveFits(tiny).ok).toBe(false);
  });

  it("would notice pages that do not tile their own scene", () => {
    expect(checkPagesTileScene(V62_SCENES).ok).toBe(true);
    const broken = V62_SCENES.map((s, i) => (i === 0 ? { ...s, text: "" } : s));
    expect(checkPagesTileScene(broken).ok).toBe(false);
  });

  it("would notice a single-word page creeping in", () => {
    expect(checkPageRegister(V62_SCENES).ok).toBe(true);
    const alone: SpokenScene[] = [{ ...V62_SCENES[2], text: "Cold." }];
    expect(checkPageRegister(alone).ok).toBe(false);
  });

  it("would notice a poster frame carrying only a fragment", () => {
    expect(checkFirstPageComplete(V62_SCENES).ok).toBe(true);
    const short = V62_SCENES.map((s, i) => (i === 0 ? { ...s, text: "You read." } : s));
    expect(checkFirstPageComplete(short).ok).toBe(false);
    const fragment = V62_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: "You read it in four seconds and" } : s,
    );
    expect(checkFirstPageComplete(fragment).ok).toBe(false);
  });

  /**
   * 🔴🔴 THE GATE THAT CAUGHT V61'S PAYOFF INVERSION. Here the mutant is this
   * cut's own worst case: dropping the full stop lets the refusal split and
   * leave "the right ones stay long enough." alone on screen — which is the
   * consolation, stated as fact, exactly inverted.
   */
  it("would notice a page that ends mid-sentence", () => {
    expect(checkPagesAreWholeSentences(V62_SCENES).ok).toBe(true);
    const broken = V62_SCENES.map((s, i) =>
      i === V62_PAYOFF_INDEX ? { ...s, text: "I won't tell you the right ones stay long enough" } : s,
    );
    expect(checkPagesAreWholeSentences(broken).ok).toBe(false);
  });

  it("would notice a page too large for the safe box", () => {
    expect(checkPageFits(V62_SCENES).ok).toBe(true);
    const broken = V62_SCENES.map((s, i) =>
      i === 0 ? { ...s, text: `${"unpronounceablewordthatcannotfit".repeat(2)} and more` } : s,
    );
    expect(checkPageFits(broken).ok).toBe(false);
  });

  it("would notice an accent that vanishes into its own ink", () => {
    expect(checkAccentContrast(V62_SCENES).ok).toBe(true);
    const broken = V62_SCENES.map((s, i) => (i === 0 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(broken).ok).toBe(false);
  });

  it("would notice ink or an accent that cannot be read on its plate", () => {
    expect(checkTextContrast(V62_SCENES).ok).toBe(true);
    const darkInk = V62_SCENES.map((s, i) => (i === 5 ? { ...s, fg: "#1C1712" } : s));
    expect(checkTextContrast(darkInk).ok).toBe(false);
    const paleGround = V62_SCENES.map((s, i) => (i === 0 ? { ...s, bg: "chalk-g" } : s));
    expect(checkTextContrast(paleGround).ok).toBe(false);
  });

  it("would notice a per-scene scrim, which flattens the ladder by construction", () => {
    expect(checkConstantScrim(V62_SCENES).ok).toBe(true);
    const broken = V62_SCENES.map((s, i) => (i === 0 ? { ...s, scrim: "heavy" as const } : s));
    expect(checkConstantScrim(broken).ok).toBe(false);
  });

  it("would notice an ink polarity change, which it cannot render", () => {
    expect(checkSingleInkPolarity(V62_SCENES).ok).toBe(true);
    const broken = V62_SCENES.map((s, i) => (i === 3 ? { ...s, fg: "#1C1712" } : s));
    expect(checkSingleInkPolarity(broken).ok).toBe(false);
  });

  it("would notice a payoff that lands too early", () => {
    expect(checkPayoffLate(V62_SCENES, V62_PAYOFF_INDEX).ok).toBe(true);
    expect(checkPayoffLate(V62_SCENES, 1).ok).toBe(false);
  });

  it("holds every derived scene inside the format's floor and ceiling", () => {
    for (const s of V62_SCENES) {
      expect(sceneFrames(s)).toBeGreaterThanOrEqual(SPOKEN_SCENE_MIN);
      expect(sceneFrames(s)).toBeLessThanOrEqual(SPOKEN_SCENE_MAX);
    }
  });
});

/**
 * 🔴🔴 THE REFUSAL THIS CUT INHERITS, ASSERTED AS A NEGATIVE.
 *
 * `BELIEF_CORRECTION_SEVEN` (src/viral/templates.ts) refused to name 7's
 * friendship row on screen because doing so *"would hand a 7 a verdict about
 * being alone"*, and `content/angles.json` inherits that into `one-way-match`.
 * A grep for a phrase that is PRESENT can never detect one that was removed, so
 * the ban lives here, with a positive control proving the check can fail.
 */
describe("V62 — what this cut refuses to say about a 7", () => {
  const FORBIDDEN = [
    "alone",
    "lonely",
    "friend",
    "enemy",
    "neutral",
    "match",
    "compatib",
    "ketu",
    "yourself",
    "itself",
  ];

  const prose = (scenes: SpokenScene[]) =>
    scenes
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();

  it("never names the friendship table, a pair, a planet or being alone", () => {
    for (const word of FORBIDDEN) expect(prose(V62_SCENES)).not.toContain(word);
  });

  /** The control: the sentence the refusal exists to keep off screen. */
  it("would fail if the verdict were put back in", () => {
    const violating = V62_SCENES.map((s, i) =>
      i === 3 ? { ...s, text: "You are the only number not friendly to itself." } : s,
    );
    const hit = FORBIDDEN.some((w) => prose(violating).includes(w));
    expect(hit).toBe(true);
  });
});

describe("V62 — what this cut commits to", () => {
  /**
   * 🔴 TWO POSTS IN A ROW MAY NOT OPEN ON THE SAME FRAME (V43 → V44: 1s hold
   * halved). V61 is the immediate predecessor; V60 the one before it.
   */
  it("opens on a plate and a line neither V61 nor V60 used", () => {
    expect(V62_SCENES[0].bg).not.toBe(V61_SCENES[0].bg);
    expect(V62_SCENES[0].bg).not.toBe(V60_SCENES[0].bg);
    expect(V62_SCENES[0].text).not.toBe(V61_SCENES[0].text);
    expect(V62_SCENES[0].bg).toBe("stone-d");
  });

  /** ⛔ No plate of V61's six, so two consecutive spoken cuts share no world. */
  it("reuses measured plates but none of V61's", () => {
    const v61 = new Set(V61_SCENES.map((s) => s.bg));
    for (const s of V62_SCENES) expect(v61.has(s.bg)).toBe(false);
  });

  /** 🔴 DURATION MUST KEEP VARYING — a fixed length once read as repeated content. */
  it("runs a different length from the cut before it", () => {
    expect(totalFrames(V62_SCENES)).not.toBe(totalFrames(V61_SCENES));
  });

  /**
   * ⭐ THE MIX THE OWNER ASKED FOR: the number is present, and it is present in
   * exactly ONE beat — the turn. A digit anywhere in beats 0-2 would make this a
   * number-first cut, which is the V44 failure.
   */
  it("puts the number at the turn and nowhere before it", () => {
    expect(V62_SCENES[3].text).toMatch(/\d/);
    for (const i of [0, 1, 2]) expect(V62_SCENES[i].text).not.toMatch(/\d/);
    expect(V62_SCENES[V62_PAYOFF_INDEX].text).not.toMatch(/\d/);
  });

  /** The dates ARE moolank 7 — digit arithmetic, the cut's only factual claim. */
  it("names the three birth dates that reduce to 7, and no others", () => {
    const dates = [...V62_SCENES[3].text.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
    expect(dates).toEqual([7, 16, 25]);
    for (const d of dates) {
      const reduced = String(d)
        .split("")
        .reduce((a, c) => a + Number(c), 0);
      expect(reduced > 9 ? reduced - 9 : reduced).toBe(7);
    }
  });

  it("keeps one ink polarity, cream throughout", () => {
    expect(V62_SCENES.every((s) => !isDarkInk(s))).toBe(true);
    expect(polarityCrossings(V62_SCENES)).toEqual([]);
  });

  it("descends at every step to the payoff and lifts once, for the ask", () => {
    const ladder = V62_SCENES.map((s) => groundLuma(s.bg, s.scrim) as number);
    const steps = ladder.slice(1).map((v, i) => v - ladder[i]);
    expect(steps.slice(0, V62_PAYOFF_INDEX).every((d) => d < 0)).toBe(true);
    expect(steps[V62_PAYOFF_INDEX]).toBeGreaterThan(5);
  });

  /**
   * ⭐ The span the single-polarity rule allows. V61 delivered 42.1 and the
   * format note calls that the constraint worth beating; this must not regress.
   */
  it("delivers more luma range than V61 did", () => {
    const span = (scenes: SpokenScene[]) => {
      const l = scenes.map((s) => groundLuma(s.bg, s.scrim) as number);
      return Math.max(...l) - Math.min(...l);
    };
    expect(span(V62_SCENES)).toBeGreaterThan(span(V61_SCENES));
  });

  /**
   * ⭐⭐⭐ THE REFUSAL IS THE BEAT, AND IT PROMISES NOTHING IN PLACE OF WHAT IT
   * WITHHOLDS. The lie this theme invites is "the right ones will wait".
   */
  it("refuses the consolation without promising anything in its place", () => {
    const payoff = V62_SCENES[V62_PAYOFF_INDEX];
    expect(payoff.text.toLowerCase()).toContain("won't tell you");
    for (const promise of ["will", "gets better", "works out", "meant to be", "one day", "happen"]) {
      expect(payoff.text.toLowerCase()).not.toContain(promise);
    }
  });

  it("asks for a send to someone with the same behaviour, and bookends frame 0", () => {
    const ask = V62_SCENES[V62_SCENES.length - 1];
    expect(ask.text.toLowerCase()).toContain("send this to");
    expect(ask.text).toContain("answered three days later");
    expect(V62_SCENES[0].text).toContain("answered three days later");
  });

  it("pages into phrases, never into single words", () => {
    for (const s of V62_SCENES) {
      const pages = scenePageCaptions(s);
      expect(pages.length).toBeGreaterThan(0);
      for (const p of pages) expect(pageWords(p)).toBeGreaterThanOrEqual(MIN_PAGE_WORDS);
    }
    expect(pageWords(scenePageCaptions(V62_SCENES[0])[0])).toBeGreaterThanOrEqual(
      MIN_FIRST_PAGE_WORDS,
    );
  });

  /** V61's own gates must still pass — this cut must not have moved the format. */
  it("leaves V61 renderable", () => {
    expect(runSpokenGates(V61_SCENES, V61_PAYOFF_INDEX).filter((g) => !g.ok)).toEqual([]);
  });
});
