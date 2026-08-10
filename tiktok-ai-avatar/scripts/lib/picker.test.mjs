import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { pickAlgorithmicBatch } from "./picker.mjs";
import { makeHookIndex } from "./hooks-source.mjs";

// The algorithmic picker is the DAY 8+ path — every day from here on, forever,
// unattended once launchd is installed. A copy defect here is not a one-off:
// it ships three times a day until someone notices.
const batch = (dayIndex = 8) =>
  pickAlgorithmicBatch({ videos: [] }, "2026-07-31", dayIndex, makeHookIndex());

describe("algorithmic TikTok captions", () => {
  it("never turns an imperative CTA into a question", () => {
    // Every CTA_BANK entry is an instruction — "Comment your birth date",
    // "Drop your date below". Appending "?" produced "Comment your birth
    // date?", which reads as uncertainty about whether to ask.
    for (const c of batch().concepts) {
      expect(c.tiktokCaption).not.toMatch(/(?:Comment your birth date|Drop your date below|Comment below(?: if this is you)?)\?/);
    }
  });

  it("never emits two question marks in one caption", () => {
    // "Are you a 2? Comment below?" — the CTA already carries its own
    // question, so the appended one doubles up.
    for (const c of batch().concepts) {
      const marks = (c.tiktokCaption.match(/\?/g) ?? []).length;
      expect(marks, c.tiktokCaption).toBeLessThanOrEqual(1);
    }
  });

  it("ends the caption the way the hand-authored ones do", () => {
    // House style, taken from the week-1 captions a human wrote:
    // "...Comment your date for both 👇". The Instagram line in this same
    // function already does this; TikTok was the odd one out.
    for (const c of batch().concepts) {
      expect(c.tiktokCaption.trimEnd(), c.tiktokCaption).toMatch(/👇$/);
    }
  });

  it("still contains the hook and the call to action", () => {
    // Guard against "fixing" the punctuation by dropping the content.
    for (const c of batch().concepts) {
      expect(c.tiktokCaption).toContain(c.ctaText);
      expect(c.tiktokCaption.length).toBeGreaterThan(20);
    }
  });
});

describe("a day's two videos are a pair, not a duplicate", () => {
  // Both slots now draw the SAME category (the day's series), and the hook
  // lookup only excludes hooks used in PAST state — not ones already taken by
  // this same batch. Without a guard, both of the day's videos get the
  // identical hook and the pair is one video posted twice.
  // Wednesday: category "educational", which has NO moolank number to
  // disambiguate the two slots. Monday would pass for the wrong reason —
  // "identity" gives each slot a different number, so the hooks differ by
  // accident rather than by design.
  const dayWithTwoSlots = "2026-08-05";

  it("gives the two slots different hooks", () => {
    const { concepts } = pickAlgorithmicBatch({ videos: [] }, dayWithTwoSlots, 8, makeHookIndex());
    if (concepts.length < 2) return; // Tuesday-style single-slot days are fine
    expect(concepts[0].hookId).not.toBe(concepts[1].hookId);
  });

  it("gives the two slots different titles", () => {
    const { concepts } = pickAlgorithmicBatch({ videos: [] }, dayWithTwoSlots, 8, makeHookIndex());
    if (concepts.length < 2) return;
    expect(concepts[0].title).not.toBe(concepts[1].title);
  });

  it("keeps both on the day's theme", () => {
    const { concepts } = pickAlgorithmicBatch({ videos: [] }, dayWithTwoSlots, 8, makeHookIndex());
    const cats = new Set(concepts.map((c) => c.category));
    expect(cats.size).toBe(1);
  });
});

/**
 * 🔴🔴 A HOOK THAT CARRIES A NUMBER STATES THAT NUMBER ON SCREEN.
 *
 * `id-6-everyone-leans` reads "Venus rules the 6" in its subtext. The picker
 * matched hook.number correctly on its FIRST attempt and then, if nothing was
 * free, fell back to `h.category === category` alone — dropping the number
 * constraint entirely. Measured on a real dry run: V31 was composed as
 * **Moolank 3**, given that Moolank-6 hook, and set over Jupiter/3 traits. It
 * would have gone out telling a stranger Venus rules their number.
 *
 * Same class as the fabricated moolanks in 8013789: not a crash, not a failing
 * test — a confident wrong claim, rendered and published.
 *
 * A hook with NO `number` makes no such claim and stays a legal fallback.
 */
describe("a hook's number must match the video's number", () => {
  const hooks = makeHookIndex();
  const LEDGER = JSON.parse(
    readFileSync(new URL("../../content/daily-state.json", import.meta.url), "utf8"),
  );

  /**
   * ⭐ Against the LIVE ledger, not `{ videos: [] }`. The bug needs the
   * number-matching hook to be unavailable -- taken by the other slot, or
   * inside the 21-day no-repeat window -- and an empty ledger never gets
   * there. Written first against empty state, this test passed while the bug
   * was live and proved nothing.
   */
  const realBatch = (dateISO, day) =>
    pickAlgorithmicBatch(LEDGER, dateISO, day, hooks).concepts;

  const DATES = ["2026-08-09", "2026-08-10", "2026-08-11", "2026-08-12"];
  const DAYS = Array.from({ length: 30 }, (_, i) => i + 8);

  const everyPairing = () => {
    const out = [];
    for (const date of DATES)
      for (const day of DAYS)
        for (const c of realBatch(date, day))
          out.push({ date, day, concept: c, hook: hooks.get(c.hookId) });
    return out;
  };

  it("never states a number the video is not about", () => {
    const wrong = everyPairing()
      .filter(({ concept, hook }) => hook?.number && hook.number !== concept.moolank)
      .map(
        ({ date, day, concept, hook }) =>
          `${date} d${day}: Moolank ${concept.moolank} got ${hook.id} (n=${hook.number}) "${hook.sub ?? ""}"`,
      );

    expect(wrong).toEqual([]);
  });

  // The positive control: this sweep must actually reach the fallback branch,
  // or the assertion above is vacuous.
  it("actually exercises the fallback -- a positive control", () => {
    const identity = everyPairing().filter(({ concept }) => concept.category === "identity");

    expect(identity.length).toBeGreaterThan(20);
  });
});
