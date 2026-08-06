import { describe, expect, it } from "vitest";
import { MOOLANK_CARDS, MOOLANK_NUMBERS } from "./card-data";

/**
 * `card-data.ts` is a COPY of the app's interpretation table (a separate private
 * repo, so it cannot be imported). These tests are what stops the copy drifting
 * into something the paid readings would contradict.
 *
 * ⭐ The friendship assertion is not hypothetical. The first draft of this data
 * listed Moolank 1's lucky numbers as 3 and 9 — both of which the engine calls
 * 1's ENEMIES. A card telling someone their worst-matched number is lucky is
 * worse than a card with no lucky numbers at all.
 */

/** Transcribed from vedic-numerology/lib/numerology/friendship.ts. */
const FRIENDSHIP: Record<number, { friend: number[]; enemy: number[] }> = {
  1: { friend: [1, 2, 4, 7], enemy: [3, 9] },
  2: { friend: [1, 2, 7, 9], enemy: [8] },
  3: { friend: [3, 6, 9], enemy: [1] },
  4: { friend: [1, 2, 4, 7, 8], enemy: [3, 9] },
  5: { friend: [3, 5, 6, 9], enemy: [] },
  6: { friend: [3, 6, 9], enemy: [] },
  7: { friend: [2, 3, 6], enemy: [9] },
  8: { friend: [3, 4, 6, 8], enemy: [1, 9] },
  9: { friend: [3, 6, 9], enemy: [4, 7] },
};

/** Ruling planets, from the same source. */
const PLANETS: Record<number, string> = {
  1: "Sun", 2: "Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury",
  6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars",
};

describe("moolank card data", () => {
  it("covers all nine numbers", () => {
    expect(MOOLANK_NUMBERS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("names the ruling planet the app's readings use", () => {
    for (const n of MOOLANK_NUMBERS) {
      expect(MOOLANK_CARDS[n].planet).toBe(PLANETS[n]);
    }
  });

  it("lists exactly the engine's friendly numbers as lucky", () => {
    for (const n of MOOLANK_NUMBERS) {
      expect(MOOLANK_CARDS[n].luckyNumbers).toEqual(FRIENDSHIP[n].friend);
    }
  });

  it("never presents an enemy number as lucky", () => {
    for (const n of MOOLANK_NUMBERS) {
      for (const lucky of MOOLANK_CARDS[n].luckyNumbers) {
        expect(FRIENDSHIP[n].enemy).not.toContain(lucky);
      }
    }
  });

  /**
   * ⭐⭐ THE DATE-LIST HOOK RULE, confirmed three times against real accounts at
   * 41K–55K likes ("9, 18, 27" and "4, 13, 22, 31"). V28 named only "the 4th"
   * and cut its addressable audience to roughly a quarter. Every qualifying
   * date must appear.
   */
  it("names EVERY qualifying birth date, not just the first", () => {
    const expected: Record<number, number[]> = {
      1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30],
      4: [4, 13, 22, 31], 5: [5, 14, 23], 6: [6, 15, 24],
      7: [7, 16, 25], 8: [8, 17, 26], 9: [9, 18, 27],
    };
    for (const n of MOOLANK_NUMBERS) {
      const found = MOOLANK_CARDS[n].bornOn.match(/\d+/g)?.map(Number) ?? [];
      expect(found).toEqual(expected[n]);
    }
  });

  it("keeps every field short enough to fit a card box", () => {
    for (const n of MOOLANK_NUMBERS) {
      const c = MOOLANK_CARDS[n];
      expect(c.personality.length, `${n} personality`).toBeLessThanOrEqual(60);
      expect(c.innerWorld.length, `${n} innerWorld`).toBeLessThanOrEqual(95);
      expect(c.relationships.length, `${n} relationships`).toBeLessThanOrEqual(95);
      // ~68 chars is one line in the full-width remedy box at 26px, ~136 is two.
      // The ceiling is two CLEAN lines: past 136 a third line starts with an
      // orphaned word, which on a card reads as a mistake rather than wrapping.
      expect(c.remedy.length, `${n} remedy`).toBeLessThanOrEqual(136);
      expect(c.mantra.length, `${n} mantra`).toBeLessThanOrEqual(34);
      for (const s of c.strengths) expect(s.length, `${n} strength "${s}"`).toBeLessThanOrEqual(38);
      for (const s of c.shadow) expect(s.length, `${n} shadow "${s}"`).toBeLessThanOrEqual(42);
    }
  });

  it("gives every number three strengths and three shadow lines at minimum", () => {
    for (const n of MOOLANK_NUMBERS) {
      expect(MOOLANK_CARDS[n].strengths.length).toBeGreaterThanOrEqual(3);
      expect(MOOLANK_CARDS[n].shadow.length).toBeGreaterThanOrEqual(3);
    }
  });

  /**
   * The standing content-safety softening (see V06's "angry 9"): a shadow side
   * describes an energy to manage, never a verdict on the person reading it.
   * These cards are read by people born on that exact date.
   */
  it("phrases the shadow side without labelling the reader", () => {
    const verdicts = /\byou are\b|\byou're\b|\bnever\b will|\balways\b fail/i;
    for (const n of MOOLANK_NUMBERS) {
      for (const s of MOOLANK_CARDS[n].shadow) {
        expect(s, `${n}: "${s}"`).not.toMatch(verdicts);
      }
    }
  });
});

/**
 * ⭐⭐ THE OPENING IS THE ONE BEAT WITH MEASURED CONSEQUENCES.
 * Moolank 8, 2026-08-06: TikTok "most viewers stopped watching at 0:01", avg
 * watch 2.4s; Instagram skip rate 91.5%, avg watch 2s. Only Moolank 8 has been
 * re-rendered against these rules — the other eight ship the moment they are
 * rendered, so the copy has to be pinned before it can be pasted into a render.
 */
describe("the problem hook", () => {
  it("exists for every number", () => {
    for (const n of MOOLANK_NUMBERS) {
      const h = MOOLANK_CARDS[n].problemHook;
      expect(h, `${n}`).toBeTruthy();
      expect(h.ask.length, `${n}`).toBeGreaterThan(0);
      expect(h.twist.length, `${n}`).toBeGreaterThan(0);
      expect(h.promise.length, `${n}`).toBeGreaterThan(0);
    }
  });

  /**
   * 🔴 FRAME ZERO IS THE ONLY FRAME EVERY VIEWER IS GUARANTEED TO SEE, and it
   * holds ask[0] alone. A line too long to take in at a glance wastes it.
   */
  it("opens on a line short enough to read at a glance", () => {
    for (const n of MOOLANK_NUMBERS) {
      const first = MOOLANK_CARDS[n].problemHook.ask[0];
      expect(first.length, `${n}: "${first}"`).toBeLessThanOrEqual(34);
    }
  });

  /**
   * ⭐ It has to ASK, not tell. The same safety softening that governs `shadow`
   * binds harder here, because this line is aimed at the viewer rather than
   * describing a number: a question they may recognise is fair, a verdict on
   * who they are is not.
   */
  it("asks a question rather than delivering a verdict", () => {
    const verdicts = /\byou are\b|\byou're\b|\byou will never\b/i;
    for (const n of MOOLANK_NUMBERS) {
      const { ask, twist } = MOOLANK_CARDS[n].problemHook;
      expect(ask.join(" "), `${n}`).toMatch(/\?$/);
      expect(ask.join(" "), `${n}`).not.toMatch(verdicts);
      expect(twist, `${n}`).not.toMatch(verdicts);
    }
  });

  /** The promise is what the remedy beat later pays off — keep them coupled. */
  it("promises the remedy the card actually contains", () => {
    for (const n of MOOLANK_NUMBERS) {
      expect(MOOLANK_CARDS[n].problemHook.promise).toMatch(/remedy/i);
      expect(MOOLANK_CARDS[n].remedy.length).toBeGreaterThan(0);
    }
  });
});
