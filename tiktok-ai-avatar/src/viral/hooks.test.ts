import { describe, expect, it } from "vitest";
import { HOOK_LIBRARY, HOOK_TEST_SEVEN, type Hook } from "./hooks";

/**
 * Guards the copy rules. These aren't style preferences — each one maps to a
 * concrete failure on a 1080x1920 frame at 1.6 seconds of hook time.
 */

const MAX_LINE = 22; // chars; beyond this, 112px type wraps to three rows
const all: Hook[] = [...HOOK_LIBRARY, ...HOOK_TEST_SEVEN];

describe("hook library", () => {
  it("has 50 hooks", () => {
    expect(HOOK_LIBRARY).toHaveLength(50);
  });

  it("covers all five categories evenly", () => {
    const counts = HOOK_LIBRARY.reduce<Record<string, number>>((acc, h) => {
      acc[h.category] = (acc[h.category] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({
      identity: 10,
      "knowledge-gap": 10,
      "comment-bait": 10,
      educational: 10,
      story: 10,
    });
  });

  it("has unique ids", () => {
    const ids = all.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every rendered line short enough not to wrap to three rows", () => {
    const tooLong = all.flatMap((h) =>
      [
        ["text", h.text],
        ["accent", h.accent],
      ]
        .filter(([, v]) => (v as string).length > MAX_LINE)
        .map(([field, v]) => `${h.id}.${field}: "${v}" (${(v as string).length})`),
    );
    expect(tooLong).toEqual([]);
  });

  it("anchors every hook to a number, a date, or the viewer", () => {
    // The spec's rule: a hook must contain a number, date, or personal reference.
    const anchored = (h: Hook) => {
      const s = `${h.text} ${h.accent} ${h.sub ?? ""}`.toLowerCase();
      return /\d/.test(s) || /\byou(r|'re)?\b|\bmy\b|\bme\b/.test(s);
    };
    expect(all.filter((h) => !anchored(h)).map((h) => h.id)).toEqual([]);
  });

  it("never states a hook as a single run-on with two ideas", () => {
    // A comma inside `text` almost always means two thoughts crammed together.
    // Date lists ("7th, 16th") are the legitimate exception.
    const isDateList = (s: string) => /\d(st|nd|rd|th)?,/.test(s);
    const offenders = all
      .filter((h) => h.text.includes(",") && !isDateList(h.text))
      .map((h) => h.id);
    expect(offenders).toEqual([]);
  });

  it("provides exactly 10 variations for the Moolank 7 A/B set", () => {
    expect(HOOK_TEST_SEVEN).toHaveLength(10);
    expect(new Set(HOOK_TEST_SEVEN.map((h) => h.number))).toEqual(new Set([7]));
  });
});
