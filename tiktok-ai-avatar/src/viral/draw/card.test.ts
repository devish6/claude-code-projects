import { describe, expect, test } from "vitest";

import DRAW from "../../../content/draws/september-2026.json";
import {
  MAX_GROUND_SPAN,
  MIN_TEXT_CONTRAST,
  assertCardRenderable,
  checkBodyLength,
  checkBornOn,
  checkDistinctCards,
  checkDrawDisclosed,
  checkGroundFlatness,
  checkNoMapping,
  checkNoPromise,
  checkOneGround,
  checkSetShape,
  checkAccentContrast,
  checkTextContrast,
  contrastRatio,
  relLuminance,
  runCardGates,
  veiled,
  words,
  type DrawSlide,
} from "./card";
import { CARD_GROUND_BANDS, CARD_HEIGHT, CARD_WIDTH } from "./card-bands";
import { GROUND, SEPTEMBER_2026 } from "./september-2026";

const slides = SEPTEMBER_2026;
/** Structured clone so a positive control cannot mutate the shipped set. */
const mutate = (fn: (s: DrawSlide[]) => void): DrawSlide[] => {
  const copy: DrawSlide[] = JSON.parse(JSON.stringify(slides));
  fn(copy);
  return copy;
};

describe("the September set as it ships", () => {
  test("every gate passes", () => {
    const failed = runCardGates(slides).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  test("assertCardRenderable does not throw", () => {
    expect(() => assertCardRenderable("DrawCard-September-2026", slides)).not.toThrow();
  });

  test("is a cover plus nine, in order", () => {
    expect(slides).toHaveLength(10);
    expect(slides.map((s) => s.moolank)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("the nine cards are exactly the nine that were dealt", () => {
    // ⭐ The point of this test: the copy is written to the DRAW, so if anyone
    // edits september-2026.ts to a card they preferred, this fails.
    const shipped = slides.filter((s) => s.moolank !== 0).map((s) => [s.moolank, s.cardId]);
    const dealt = DRAW.cards.map((c) => [c.moolank, c.cardId]);
    expect(shipped).toEqual(dealt);
  });

  test("each slide's keywords are the dealt card's own, unedited", () => {
    const dealt = new Map(DRAW.cards.map((c) => [c.moolank, c.keywords]));
    for (const s of slides.filter((x) => x.moolank !== 0)) {
      expect(s.keywords, `moolank ${s.moolank}`).toEqual(dealt.get(s.moolank));
    }
  });

  test("every body sits in the readable band", () => {
    for (const s of slides) {
      expect(words(s.body), `slide ${s.moolank}`).toBeGreaterThanOrEqual(60);
      expect(words(s.body), `slide ${s.moolank}`).toBeLessThanOrEqual(150);
    }
  });

  test("every number slide names every qualifying date", () => {
    for (const s of slides.filter((x) => x.moolank !== 0)) {
      expect(s.bornOn, `moolank ${s.moolank}`).toMatch(/^Born on the .+ or \d+(st|nd|rd|th)$/);
    }
  });
});

describe("the ground", () => {
  test("linen-b is the shipped plate and it is measured at 4:5", () => {
    expect(GROUND).toBe("linen-b");
    expect(CARD_GROUND_BANDS[GROUND]).toBeDefined();
    expect([CARD_WIDTH, CARD_HEIGHT]).toEqual([1080, 1350]);
  });

  test("the worst band clears the ink floor, not merely the mean", () => {
    const ink = relLuminance([38, 30, 24]);
    const ratios = CARD_GROUND_BANDS[GROUND].map((b) => contrastRatio(relLuminance(veiled(b)), ink));
    expect(Math.min(...ratios)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  test("🪤 chalk-g — V59's plate — FAILS flatness at 4:5", () => {
    // The positive control that matters most here: the plate the design
    // originally specified is rejected, because its 13.1 span is the 9:16 copy
    // strip and `cover` at 4:5 keeps a different crop entirely.
    const g = checkGroundFlatness(mutate((s) => s.forEach((x) => (x.bg = "chalk-g"))));
    expect(g.ok).toBe(false);
    const span = Number(g.detail?.match(/chalk-g span ([\d.]+)/)?.[1]);
    expect(span).toBeGreaterThan(MAX_GROUND_SPAN);
  });

  test("a dark plate FAILS the ink floor", () => {
    const g = checkTextContrast(mutate((s) => s.forEach((x) => (x.bg = "night-a"))));
    expect(g.ok).toBe(false);
  });

  test("an unmeasured ground FAILS rather than passing vacuously", () => {
    const g = checkTextContrast(mutate((s) => s.forEach((x) => (x.bg = "no-such-plate"))));
    expect(g.ok).toBe(false);
    expect(g.detail).toMatch(/unmeasured/);
  });
});

describe("positive controls — every gate must be able to fail", () => {
  test("set shape catches a missing number", () => {
    expect(checkSetShape(slides.filter((s) => s.moolank !== 5)).ok).toBe(false);
  });

  test("one ground catches a mixed set", () => {
    expect(checkOneGround(mutate((s) => (s[3].bg = "curtain-h"))).ok).toBe(false);
  });

  test("body length catches a stub", () => {
    const g = checkBodyLength(mutate((s) => (s[2].body = "Too short.")));
    expect(g.ok).toBe(false);
    expect(g.detail).toMatch(/slide 2/);
  });

  test("born-on catches a dropped date line", () => {
    expect(checkBornOn(mutate((s) => (s[7].bornOn = ""))).ok).toBe(false);
  });

  test("distinct cards catches a repeat", () => {
    const g = checkDistinctCards(mutate((s) => (s[2].cardId = s[1].cardId)));
    expect(g.ok).toBe(false);
  });

  test.each([
    ["you will", "This is what you will find in September."],
    ["guarantee", "The card is a guarantee of what follows."],
    ["destined", "A 4 is destined to finish it this time."],
    ["by the end of", "It resolves by the end of the month."],
    ["within weeks", "It arrives within weeks of the new moon."],
  ])("no-promise catches %s", (_label, sentence) => {
    const g = checkNoPromise(mutate((s) => (s[4].body = `${s[4].body} ${sentence}`)));
    expect(g.ok).toBe(false);
  });

  test.each([
    ["belongs to", "The Ace of Pentacles belongs to Moolank 4."],
    ["is assigned", "Each card is assigned by the birth number."],
    ["your card is", "If you are a 4 your card is the Ace."],
    ["corresponds to", "The suit corresponds to your element."],
    ["always draws", "A 4 always draws a Pentacle."],
  ])("no-mapping catches %s", (_label, sentence) => {
    const g = checkNoMapping(mutate((s) => (s[4].body = `${s[4].body} ${sentence}`)));
    expect(g.ok).toBe(false);
  });

  test("no-mapping allows the honest phrasing", () => {
    const ok = mutate(
      (s) => (s[4].body = `${s[4].body} The card that came up beside this number was the Ace.`),
    );
    expect(checkNoMapping(ok).ok).toBe(true);
  });

  test("draw-disclosed catches a cover that hides the randomness", () => {
    const g = checkDrawDisclosed(
      mutate((s) => {
        s[0].title = "Your September cards";
        s[0].body = "One card for every birth number, read them below and find yours today.";
      }),
    );
    expect(g.ok).toBe(false);
    expect(g.detail).toMatch(/missing/);
  });

  test("draw-disclosed catches a cover that says drawn but not random", () => {
    const g = checkDrawDisclosed(
      mutate((s) => {
        s[0].title = "Nine cards, drawn.";
        s[0].body = "One drawn card for every birth number. Find the day you were born below.";
      }),
    );
    expect(g.ok).toBe(false);
    expect(g.detail).toMatch(/randomness/);
  });

  test("assertCardRenderable names every failing gate at once", () => {
    const broken = mutate((s) => {
      s[1].body = "short";
      s[2].bg = "night-a";
    });
    expect(() => assertCardRenderable("Broken", broken)).toThrow(/body length[\s\S]*|one ground/);
  });
});

describe("🪤 the veil must not do the plate's job", () => {
  test("a near-black plate fails the ink floor at the shipped alpha", () => {
    // At VEIL_ALPHA 0.42 this PASSED at 3.19:1 — the wash, not the plate, was
    // clearing the floor, which made checkTextContrast unable to fail.
    const g = checkTextContrast(mutate((s) => s.forEach((x) => (x.bg = "night-a"))));
    expect(g.ok).toBe(false);
  });

  test("a mid plate fails the accent even where it clears the ink", () => {
    const dark = mutate((s) => s.forEach((x) => (x.bg = "stone-d")));
    expect(checkTextContrast(dark).ok).toBe(true);
    expect(checkAccentContrast(dark).ok).toBe(false);
  });
});
