import type { KineticScene, KineticTable } from "./scenes";

/**
 * V49 — A 1 GETS MORE DAYS THAN YOU DO.
 *
 * ⛔ THIS IS EPISODE 2 OF V48's FORMAT, NOT A SEVENTH NEW ONE. The package is
 * held exactly — same seven scenes, same seconds, same ground order, same
 * scrims, same kicker, payoff at index 5. Only the episode content moves.
 *
 * ⭐⭐⭐⭐ WHY A REPEAT, AGAINST THE INSTINCT TO RE-CUT. Measured 2026-08-28
 * across all 62 reels: the creative held constant spans 10× in views. Three
 * natural controls, none of them run on purpose —
 *   • 07-16, three reels posted FOUR MINUTES APART, same series, same caption
 *     template, only the digit differing: 1,683 / 216 / 2,409.
 *   • 08-15 and 08-16, BYTE-IDENTICAL captions: 1,935 / 188.
 *   • 08-12→08-19, the "IF YOU'RE A NUMBER N" template, one a day: 188 → 1,935.
 * σ of log₁₀(views) with the creative held is ≈0.6 — one sigma is a factor of
 * four, and detecting a 2× effect needs 62 posts an arm. V43→V48 changed the
 * format six times in six posts and read each single post as a verdict. Every
 * one of those verdicts was noise. ⇒ The noise floor forbids RE-CUTTING; it
 * does not forbid publishing. The only escape is to stop treating each post as
 * a trial and let one format accumulate — which is what the rival who wins in
 * this category actually did (6 of 8 posts over 90K, running ONE format).
 *
 * ⭐⭐⭐ AND THE STRUCTURAL REASON, which does not depend on any view count:
 * V48 PUT A LOOKUP TABLE ON SCREEN THAT YOU CANNOT LOOK ANYTHING UP IN. Its 81
 * cells were all `·` (`v48-driver-conductor.ts:120-124`), grid-line contrast
 * measured 2.02–2.34:1 against a 3.0:1 floor, and finding yourself in it took
 * two arithmetic steps, one needing your full birth year. The format's
 * hypothesis is "a complete, copyable artefact on frame 0, the way every
 * faceless winner does it." V48 never ran it. This is the first cut that does:
 * every cell filled, zero arithmetic, findable in under a second.
 *
 * ⭐⭐⭐ THE PROPERTY THE WHOLE THING RESTS ON. Lay the days out NINE TO A ROW
 * and every column is congruent mod 9 — so a column simply IS a birth number.
 * 1, 10, 19, 28 all reduce to 1 because 9, 18 and 27 are multiples of nine.
 * The viewer finds the day they were born and reads the header above it. No
 * adding, no reducing, nothing to get wrong. `v49.test.ts` derives this rather
 * than trusting it.
 *
 * ── WHERE EVERY FACT ON SCREEN COMES FROM ───────────────────────────────────
 * ⛔ NOTHING HERE IS INVENTED. Checked against the engine on 2026-08-28:
 *   • `modules/numerology-engine/core.ts:5-7` — the birth-day number is the DAY
 *     reduced to one digit, and nothing else. 23 → 2+3 → 5.
 *   • `modules/numerology-engine/digits.ts:10-16` — `reduceToSingleDigit` is a
 *     plain digit sum with NO master-number exception, so 11→2, 29→2, 31→4.
 *     That is what makes the column assignment mechanical.
 *   • The yearly counts are computed from month lengths in the test, never
 *     asserted: 1→48, 2→47, 3→47, 4→43, 5..9→36 each, summing to 365.
 *
 * 🔴🔴 THE LIMIT, AND IT IS THE PAYOFF'S OWN FOOTING — NOT A FOOTNOTE.
 * 1. **This is a fact about the CALENDAR, not about PEOPLE.** It does NOT say
 *    there are more 1s alive than 9s. Births are not uniform across days of the
 *    month and NOTHING in `vedic-numerology` models a birth-rate distribution,
 *    so "1 is the commonest birth number" is unsupported and unshippable.
 *    `v49.test.ts` bans the phrasing outright.
 * 2. **The monthly split is not the yearly split.** Per month it is
 *    4/4/4/4/3/3/3/3/3. Per year it is 48/47/47/43/36×5, because 2's fourth day
 *    is the 29th, 3's is the 30th, and 4's is the 31st — which exists in only
 *    seven months. Generalising the monthly figure to the year is exactly the
 *    pratayandar error (a `driver` inferred from an example whose driver was 8),
 *    and naming that gap IS the turn at 6.9s. Getting it backwards inverts the
 *    post.
 * 3. **Rarity is not value.** Nothing in the ruleset says a 9 is more special
 *    for having fewer days. The closing beat retires the ranking out loud.
 *
 * 🪤 AND WHAT WAS CHECKED AND REFUSED, so nobody re-proposes it:
 *   • **The 81 driver×conductor readings** — prosed, but verdict-laden.
 *     `lib/interpretation/combinations.ts:467-471` opens driver 8 / conductor 8
 *     with "the epitome of hard work, delays, and disappointments", and
 *     `lib/knowledge/seed-data/combo-safety-overrides.ts` exists precisely
 *     because entries like driver 2 / conductor 8 begin "It is a bad
 *     combination." That is a verdict on the reader. A day count carries none.
 *   • **Planes** — `rulesets/v1.ts` has `planes: []`, empty by design.
 *   • ✅ **Arrows are NOT unsupported** — V48's header says they are and it is
 *     WRONG. `lib/interpretation/combinations.ts:25-44` carries plain English
 *     for all 18 arrow keys, guarded by `tests/interpretation/coverage.test.ts`
 *     and consumed in production at `lib/admin-reading/service.ts:107`. Most of
 *     it is verdict-laden too, but `SUN_KETU` is clean and draws itself down
 *     the grid's middle column — a candidate for a later episode, not this one.
 */

/** ⭐ The chip is package, not episode. Held from V48. */
export const KICKER = "VEDIC NUMEROLOGY";

/** Nine columns, one per birth number. */
const AXIS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Four rows of nine covers 1–31 with five cells to spare. */
export const GRID_ROWS = 4;

/**
 * The worked example: born on the 23rd. 2+3 = 5, so the 23rd sits in the 5
 * column — third row down, fifth across. 🪤 If the example day changes, this
 * index must change with it; `v49.test.ts` recomputes it from the engine's
 * reduction rule and fails if the two drift apart.
 */
export const EXAMPLE_COL = 4;

/**
 * Days a year each birth number receives, 1 through 9.
 *
 * 🪤 NOT 48 ACROSS THE BOARD FOR THE FIRST FOUR. 2 loses the 29th outside a
 * leap year, 3 loses the 30th in February, and 4 loses the 31st in five months
 * — February, April, June, September, November. The test recomputes all nine
 * from real month lengths; do not hand-edit them.
 */
export const DAYS_PER_YEAR = [48, 47, 47, 43, 36, 36, 36, 36, 36];

/**
 * 🪤 A FRESH ARRAY EVERY CALL. Scenes must not share a mutable `cells` — V48
 * learned this when marking the payoff cell would have marked it in frame 0
 * too, which is the one place the answer may not appear.
 */
const cells = (opts: { totals?: boolean }): string[][] => {
  const grid = Array.from({ length: GRID_ROWS }, (_, r) =>
    AXIS.map((_c, c) => {
      const day = r * 9 + c + 1;
      return day <= 31 ? String(day) : "·";
    }),
  );
  return opts.totals ? [...grid, DAYS_PER_YEAR.map(String)] : grid;
};

export const table = (opts: { highlight?: KineticTable["highlight"]; totals?: boolean }): KineticTable => ({
  colTitle: "YOUR NUMBER",
  rowTitle: "DAY BORN",
  cols: AXIS,
  // 🪤 NO PER-ROW LABELS. The header column is 56px (`KineticVideo.tsx`'s
  // HEADER) and anything wider overflows into the grid — "A YEAR" rendered
  // straight through the lit column and clipped. The totals row needs no label:
  // 48, 47 and 43 cannot be days of a month, and the headline names the unit.
  rows: opts.totals ? ["", "", "", "", ""] : ["", "", "", ""],
  cells: cells({ totals: opts.totals }),
  highlight: opts.highlight,
});

export const V49_SCENES: KineticScene[] = [
  // ── FRAME 0. A CLAIM, AND A TABLE THAT ALREADY WORKS. ────────────────────
  //    ⛔ No question mark, no highlight — the poster frame is drawn static.
  //    The loop: the viewer can find their own column in one second, and the
  //    claim tells them somebody else's column is bigger without saying why.
  //    🔴 Cream on `heavy`, never ink on pale — every scrim darkens downward,
  //    so dark type on dawn decays to 1.4:1 against a 3.0:1 floor.
  {
    seconds: 1.9,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF6EA",
    accent: "#F4CE8E",
    kicker: KICKER,
    headline: "A 1 GETS MORE DAYS THAN YOU DO",
    table: table({}),
  },
  // ── Pay the instruction immediately, and the COLUMN LIGHTS. Never coy about
  //    the thing it opened on. ───────────────────────────────────────────────
  {
    seconds: 1.7,
    bg: "night-a",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: "FIND THE DAY YOU WERE BORN",
    sub: "the 23rd sits in the 5 column · that is your number",
    table: table({ highlight: { col: EXAMPLE_COL } }),
  },
  // ── Why the table needs no arithmetic. ⚠️ Wound, not accusation: the
  //    viewer was never shown this, they did not get it wrong. ──────────────
  {
    seconds: 1.5,
    bg: "stone-a",
    fg: "#EDEDED",
    accent: "#B9B9B9",
    headline: "NINE DAYS TO A ROW",
    sub: "so every column adds down to its own number",
  },
  // ── The copyable procedure — the arithmetic on screen, on days the viewer
  //    can swap for their own. No table here on purpose: the frame changes
  //    shape, so the grid's return at 6.9s reads as an event.
  {
    seconds: 1.8,
    bg: "water-a",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "1 · 10 · 19 · 28",
    sub: "four days a month. the 5 column only gets three.",
  },
  // ── THE TURN, at 6.9s — past the 6.4s distribution gate and still
  //    withholding the totals. The BOTTOM ROW LIGHTS, and it is the short one.
  //    ⭐ This is the beat the whole cut exists for: a month is not a year.
  {
    seconds: 1.7,
    bg: "violet-a",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    headline: "THE BOTTOM ROW IS NOT ALWAYS THERE",
    sub: "no 31st in five months · no 29th or 30th in february",
    table: table({ highlight: { row: GRID_ROWS - 1 } }),
  },
  // ── THE PAYOFF, scene index 5, at 8.6s — 70% of the runtime. The table
  //    GROWS A TOTALS ROW and the 1 column lights.
  //    ⛔ The counts stay WORDS. V43 put "4 NUMBERS" on screen in a video whose
  //    answer was 1, 2, 4 and 7 and handed the viewer a wrong answer; this
  //    frame is full of numerals, so a count as a numeral cannot be read as one.
  {
    seconds: 1.9,
    bg: "gold-b",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    headline: "FORTY-EIGHT DAYS A YEAR. OR THIRTY-SIX.",
    sub: "a 1 gets a third more year than a 9 does",
    table: table({ highlight: { col: 0 }, totals: true }),
  },
  // ── CTA — a screenshot, with the finished artefact still on screen so there
  //    is something worth saving. ⛔ Never a bare URL: half of views arrive
  //    from the Reels tab, muted, where nothing is clickable.
  //    🔴 The closing line retires the ranking. Rarity is not value, and
  //    nothing in the ruleset says otherwise.
  {
    seconds: 1.8,
    bg: "ember-b",
    scrim: "normal",
    fg: "#FFF0E6",
    accent: "#FF8A4C",
    headline: "Screenshot the table",
    sub: "that is the calendar, not a ranking · @numevix",
    table: table({ totals: true }),
  },
];

/** The scene at which the loop closes. Everything before it withholds. */
export const V49_PAYOFF_INDEX = 5;
