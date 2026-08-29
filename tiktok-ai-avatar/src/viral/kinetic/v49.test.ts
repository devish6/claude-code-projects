import { describe, expect, test } from "vitest";

import { assertKineticRenderable } from "./scenes";
import { DAYS_PER_YEAR, EXAMPLE_COL, GRID_ROWS, V49_PAYOFF_INDEX, V49_SCENES, table } from "./v49-days-per-number";

/**
 * V49 — "A 1 GETS MORE DAYS THAN YOU DO".
 *
 * The claim is arithmetic on the CALENDAR. These guards exist because this
 * repo has shipped a generalisation past the case that proved it before: the
 * pratayandar bug turned an `8` into a `driver` from an example whose driver
 * happened to be 8. Every number on screen here is recomputed from month
 * lengths, never asserted.
 */

/** The engine's rule: sum the digits, repeat until one digit. No master numbers. */
const reduce = (n: number): number => {
  let x = n;
  while (x > 9) x = String(x).split("").reduce((a, c) => a + Number(c), 0);
  return x;
};

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const yearCounts = (lengths: number[]): number[] => {
  const out = Array(9).fill(0);
  for (const len of lengths) for (let d = 1; d <= len; d += 1) out[reduce(d) - 1] += 1;
  return out;
};

const copy = (s: (typeof V49_SCENES)[number]) => `${s.headline} ${s.sub ?? ""}`;
const allCopy = V49_SCENES.map(copy).join(" ");

describe("the grid is the calendar, laid out nine days to a row", () => {
  // ⭐ THIS IS WHY THE ARTEFACT NEEDS NO ARITHMETIC. Nine days per row means
  // every column is congruent mod 9, so a column IS a birth number. The viewer
  // finds the day they were born and reads the column header. That property is
  // the whole concept, so it is derived here rather than trusted.
  test("every day sits in the column of its own birth number", () => {
    const grid = table({}).cells;

    for (let r = 0; r < GRID_ROWS; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        const day = r * 9 + c + 1;
        if (day > 31) {
          expect(grid[r][c]).toBe("·");
        } else {
          expect(grid[r][c]).toBe(String(day));
          expect(reduce(day)).toBe(c + 1);
        }
      }
    }
  });

  test("the bottom row stops after the 31st", () => {
    expect(table({}).cells[GRID_ROWS - 1].filter((c) => c !== "·")).toEqual(["28", "29", "30", "31"]);
  });
});

describe("the yearly counts are recomputed, not asserted", () => {
  test("DAYS_PER_YEAR matches a real calendar year", () => {
    expect(DAYS_PER_YEAR).toEqual(yearCounts(MONTH_LENGTHS));
  });

  test("the counts sum to a year", () => {
    expect(DAYS_PER_YEAR.reduce((a, b) => a + b, 0)).toBe(365);
  });

  // 🪤 The 4 column is the one that loses days to short months — its fourth
  // day is the 31st, which exists in only seven months. If someone "tidies"
  // the payoff to 48-against-36 for every number, this fails.
  test("4 is not on the same footing as 1, 2 and 3", () => {
    const [one, two, three, four] = DAYS_PER_YEAR;
    expect(one).toBe(48);
    expect([two, three]).toEqual([47, 47]);
    expect(four).toBe(43);
    expect(four).toBeLessThan(three);
  });

  test("5 through 9 each get three days a month, every month", () => {
    expect(DAYS_PER_YEAR.slice(4)).toEqual([36, 36, 36, 36, 36]);
  });
});

describe("the claim limit — the calendar, never the population", () => {
  // 🔴 THE ONE STEP THAT WOULD BE FALSE. Nothing anywhere in `vedic-numerology`
  // models a birth-rate distribution, so "1 is the commonest birth number" is
  // an invented population claim. The table counts DAYS ON A CALENDAR, and
  // people are not born uniformly across them.
  test("no scene claims anything about how many people hold a number", () => {
    for (const banned of [
      "MOST COMMON",
      "COMMONEST",
      "MOST PEOPLE ARE",
      "MORE PEOPLE",
      "MOST BIRTHS",
      "RAREST NUMBER",
      "FEWER PEOPLE",
    ]) {
      expect(allCopy.toUpperCase()).not.toContain(banned);
    }
  });

  // The scene that names the year totals must say they are the YEAR's, because
  // the monthly split (4/4/4/4/3/3/3/3/3) and the yearly split are different
  // shapes and conflating them is the error this cut is built around.
  test("the scene carrying the yearly totals says it is a year", () => {
    const payoff = copy(V49_SCENES[V49_PAYOFF_INDEX]).toUpperCase();

    expect(payoff).toMatch(/YEAR/);
  });

  test("the closing scene retires the ranking rather than leaving it standing", () => {
    expect(copy(V49_SCENES[V49_SCENES.length - 1]).toUpperCase()).toMatch(/CALENDAR/);
  });
});

describe("the package V48 established", () => {
  test("it renders", () => {
    expect(() => assertKineticRenderable("Kinetic-V49", V49_SCENES, V49_PAYOFF_INDEX)).not.toThrow();
  });

  test("the poster frame carries the artefact but never the answer", () => {
    const first = V49_SCENES[0];

    expect(first.table).toBeDefined();
    expect(first.table?.highlight).toBeUndefined();
    expect(first.table?.cells.length).toBe(GRID_ROWS);
    expect(copy(first)).not.toMatch(/48|36|forty|thirty/i);
  });

  test("frame 0 states a claim and never asks a question", () => {
    expect(V49_SCENES[0].headline).not.toContain("?");
  });

  // ⛔ V43 put "4 NUMBERS" on screen in a video whose answer was 1, 2, 4 and 7
  // and handed the viewer a wrong answer. Here the grid is full of numerals,
  // so a count rendered as a numeral is unreadable as a count.
  test("the payoff spells its counts as words", () => {
    const headline = V49_SCENES[V49_PAYOFF_INDEX]?.headline ?? "";

    expect(headline.toUpperCase()).toMatch(/FORTY-EIGHT/);
    expect(headline).not.toMatch(/\b48\b/);
  });

  test("the worked example is the 5 column", () => {
    expect(EXAMPLE_COL).toBe(4);
    expect(reduce(23)).toBe(EXAMPLE_COL + 1);
  });
});
