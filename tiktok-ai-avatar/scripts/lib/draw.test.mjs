import { describe, expect, test } from "vitest";

import DECK from "../../content/tarot-deck.json" with { type: "json" };
import { MOOLANKS, dealMonth, hashSeed, prng } from "./draw.mjs";

const deck = DECK.cards;

describe("the deck", () => {
  test("is the whole 78 and every id is unique", () => {
    expect(deck).toHaveLength(78);
    expect(new Set(deck.map((c) => c.id)).size).toBe(78);
  });

  test("every card carries the four fields a slide renders", () => {
    for (const c of deck) {
      expect(c.id, `${c.id}.id`).toMatch(/^[a-z0-9-]+$/);
      expect(c.name.length, `${c.id}.name`).toBeGreaterThan(0);
      expect(c.keywords.length, `${c.id}.keywords`).toBeGreaterThan(0);
      expect(c.image, `${c.id}.image`).toBe(`${c.id}.webp`);
    }
  });
});

describe("the PRNG", () => {
  // Pinned so a "harmless tidy" of the arithmetic cannot silently change what
  // a recorded seed deals. These are the values our own spread.ts produces.
  test("hashSeed is FNV-1a", () => {
    expect(hashSeed("")).toBe(0x811c9dc5);
    expect(hashSeed("a")).toBe(0xe40c292c);
  });

  test("mulberry32 is deterministic and stays in [0,1)", () => {
    const a = prng(hashSeed("numevix"));
    const b = prng(hashSeed("numevix"));
    for (let i = 0; i < 50; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("dealMonth", () => {
  test("deals one card per Moolank, in Moolank order", () => {
    const drawn = dealMonth(deck, "seed-one");
    expect(drawn.map((d) => d.moolank)).toEqual(MOOLANKS);
  });

  test("the nine are distinct", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]) {
      const drawn = dealMonth(deck, seed);
      expect(new Set(drawn.map((d) => d.cardId)).size).toBe(9);
    }
  });

  test("the same seed deals the same nine, a different seed does not", () => {
    const a = dealMonth(deck, "same");
    expect(dealMonth(deck, "same")).toEqual(a);
    expect(dealMonth(deck, "other")).not.toEqual(a);
  });

  test("every dealt card is a real card from the deck", () => {
    const ids = new Set(deck.map((c) => c.id));
    for (const d of dealMonth(deck, "real")) expect(ids.has(d.cardId)).toBe(true);
  });

  test("the deal is not biased to the front of the deck", () => {
    // A broken partial Fisher-Yates (j picked from [0,i) rather than [i,len))
    // keeps returning the first nine cards. 200 seeds must reach far past them.
    const seen = new Set();
    for (let i = 0; i < 200; i++) {
      for (const d of dealMonth(deck, `bias-${i}`)) seen.add(d.cardId);
    }
    expect(seen.size).toBeGreaterThan(60);
  });

  test("refuses a deck too small to fill nine", () => {
    expect(() => dealMonth(deck.slice(0, 8), "x")).toThrow(/need at least 9/);
  });
});
