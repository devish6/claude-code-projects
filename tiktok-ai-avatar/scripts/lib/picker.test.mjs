import { describe, it, expect } from "vitest";
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
