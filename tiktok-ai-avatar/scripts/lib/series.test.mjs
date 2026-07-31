import { describe, expect, test } from "vitest";
import { SERIES, seriesForDate, weekdayOf, slotBFor, VIDEOS_PER_DAY } from "./series.mjs";

describe("weekdayOf", () => {
  test("reads the date as written, not shifted by the local timezone", () => {
    // THE BUG THIS EXISTS TO PREVENT: `new Date("2026-08-03")` parses as UTC
    // midnight, and .getDay() reads it back in local time — so anywhere west
    // of Greenwich (the owner is in Detroit, UTC-4) it returns the PREVIOUS
    // day. That would run Sunday's series on a Monday, every week, silently.
    expect(weekdayOf("2026-08-03")).toBe(1); // a Monday
    expect(weekdayOf("2026-07-31")).toBe(5); // a Friday
    expect(weekdayOf("2026-08-02")).toBe(0); // a Sunday
  });

  test("refuses a malformed date rather than guessing a weekday", () => {
    expect(() => weekdayOf("31-07-2026")).toThrow(/YYYY-MM-DD/);
  });
});

describe("the weekly calendar", () => {
  test("covers all seven days exactly once", () => {
    // A gap means a day with no content; a duplicate means two series fighting
    // for one day. Both are silent failures in a scheduled pipeline.
    expect(SERIES).toHaveLength(7);
    expect(new Set(SERIES.map((s) => s.day)).size).toBe(7);
  });

  test("every series has a stable id and a real category", () => {
    const categories = ["identity", "knowledge-gap", "educational", "story", "comment-bait"];
    for (const s of SERIES) {
      expect(s.id, s.name).toMatch(/^[a-z0-9-]+$/);
      expect(categories, s.name).toContain(s.category);
    }
  });

  test("Monday is Moolank Monday and Friday is the story day", () => {
    expect(seriesForDate("2026-08-03").id).toBe("moolank-monday");
    expect(seriesForDate("2026-08-07").id).toBe("story-friday");
  });

  test("only Story Friday uses the cartoon format", () => {
    const cartoon = SERIES.filter((s) => s.format === "cartoon");
    expect(cartoon.map((s) => s.id)).toEqual(["story-friday"]);
  });
});

describe("the day's second video", () => {
  test("Tarot Tuesday keeps the ruling-planet video, which is on-theme there", () => {
    expect(slotBFor("2026-08-04")).toBe("daily-energy");
  });

  test("every other day pairs a second angle on the same theme", () => {
    // The requirement is that both of a day's videos read as one subject.
    for (const iso of ["2026-08-03", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08", "2026-08-09"]) {
      expect(slotBFor(iso), iso).toBe("same-theme");
    }
  });

  test("produces two videos a day, not the previous four", () => {
    expect(VIDEOS_PER_DAY).toBe(2);
  });
});
