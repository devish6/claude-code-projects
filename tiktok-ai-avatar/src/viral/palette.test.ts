import { describe, expect, test } from "vitest";

import { PALETTES, PALETTE_NAMES, contrastRatio, relativeLuminance } from "./palette";

/**
 * One palette across 14 videos was itself part of the duplicate fingerprint.
 * These tests cover the two ways multiple palettes go wrong: a missing token
 * (which renders invisible text rather than crashing), and a palette whose
 * text cannot be read on its own background.
 */

const TOKENS = [
  "GRAD_A",
  "GRAD_B",
  "GRAD_MID",
  "TEXT",
  "TEXT_SOFT",
  "ACCENT",
  "ACCENT_GREEN",
  "ON_GREEN",
  "ACCENT_ALERT",
  "DIAL_INK",
  "MOTE",
  "HALO",
  "VIGNETTE",
  "TEXT_SHADOW",
] as const;

describe("relativeLuminance", () => {
  test("reads hex", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 2);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 2);
  });

  test("reads oklch, which is how the foreground tokens are written", () => {
    // oklch lightness 1 with no chroma is white; 0 is black.
    expect(relativeLuminance("oklch(1 0 0)")).toBeGreaterThan(0.9);
    expect(relativeLuminance("oklch(0 0 0)")).toBeLessThan(0.05);
  });

  test("tolerates an alpha suffix", () => {
    expect(() => relativeLuminance("oklch(0.86 0.09 88 / 0.55)")).not.toThrow();
  });
});

describe("contrastRatio", () => {
  /** Validates the implementation against the two values WCAG fixes exactly. */
  test("is 21:1 for black on white and 1:1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrastRatio("#7F7F7F", "#7F7F7F")).toBeCloseTo(1, 1);
  });
});

describe("PALETTES", () => {
  test("offers every palette the variation engine can pick", () => {
    // The engine chooses by name; a name with no palette renders nothing.
    expect(PALETTE_NAMES).toEqual(
      expect.arrayContaining(["sage-gold", "ink-violet", "ember", "mono"]),
    );
  });

  test("every palette defines every token", () => {
    for (const name of PALETTE_NAMES) {
      for (const token of TOKENS) {
        expect(PALETTES[name][token], `${name} is missing ${token}`).toBeTruthy();
      }
      expect(typeof PALETTES[name].glowFor).toBe("function");
    }
  });

  /**
   * The readability gate. Body text must clear WCAG AA on the palette's own
   * mid background — a palette that fails this ships an unreadable video, and
   * "text must be readable on mobile" is a stated rule of the video spec.
   */
  test("body text clears 4.5:1 against its own background", () => {
    for (const name of PALETTE_NAMES) {
      const ratio = contrastRatio(PALETTES[name].TEXT, PALETTES[name].GRAD_MID);

      expect(ratio, `${name} TEXT on GRAD_MID is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  /** Accents carry large display type, so the 3:1 large-text bar applies. */
  test("accents clear 3:1 against their own background", () => {
    for (const name of PALETTE_NAMES) {
      const ratio = contrastRatio(PALETTES[name].ACCENT, PALETTES[name].GRAD_MID);

      expect(ratio, `${name} ACCENT on GRAD_MID is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    }
  });

  test("no two palettes share a text-and-background pair", () => {
    const pairs = PALETTE_NAMES.map((n) => `${PALETTES[n].TEXT}|${PALETTES[n].GRAD_MID}`);

    expect(new Set(pairs).size).toBe(pairs.length);
  });

  /**
   * A light and a dark palette need opposite text treatments: an outline on a
   * light ground reads as a sticker, and a soft drop vanishes on a dark one.
   * So the shadow token must genuinely differ across the set.
   */
  test("text shadows are not copied across every palette", () => {
    const shadows = PALETTE_NAMES.map((n) => PALETTES[n].TEXT_SHADOW);

    expect(new Set(shadows).size).toBeGreaterThan(1);
  });
});
