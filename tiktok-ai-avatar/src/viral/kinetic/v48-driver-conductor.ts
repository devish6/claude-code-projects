import type { KineticScene, KineticTable } from "./scenes";

/**
 * V48 — YOUR BIRTH DAY IS ONLY HALF YOUR NUMBER.
 *
 * ⛔ THIS IS NOT POST 3 OF THE V46/V47 ARM. THE ARM IS OVER, AND IT IS OVER FOR
 * A MEASURED REASON, NOT A MOOD.
 *
 * 1. **The arm could never have fired.** Its MDE is 0.115 against effects of
 *    0.062–0.090, and the account lost 19% of views and 25% of viewers month
 *    over month while skip drifted 0.701 -> 0.801 — a 0.100 move, the size an
 *    11-post arm could only just detect. Any read across that boundary is
 *    confounded by construction.
 * 2. **The class it was running is 0-for-30.** Classified over all 61 reels in
 *    the 60-day window by what the opening line DOES: 25 IDENTITY, 5 OUTCOME,
 *    28 FACT, 2 OFFER. Every one of the 10 posts that ever cleared 1,000 reach
 *    is an identity frame; **zero of the 30 information/offer posts has ever
 *    cleared 500 reach, in 30 attempts.** V45, V46 and V47 are all FACT-bucket
 *    (a question about a system, answered by a table) and sat at 175 / 133 /
 *    131 reach — the bottom of the last 15.
 *    🪤 Read the direction only. "Identity framing lifts reach" is NOT
 *    supported: six consecutive identity posts landed at ~180, and the SAME
 *    identity caption posted on 08-15 and 08-16 produced 1,514 and 174 reach.
 *    What survives is the claim on the LOSING side — information framing has a
 *    ceiling — because falsifying it needs one information post to win and 30
 *    tries across two eras have not produced one.
 *
 * ── THE FIVE RULES THIS CUT EXISTS TO TEST ──────────────────────────────────
 *
 * ⭐⭐⭐ 1. AN ARTEFACT ON SCREEN IN FRAME 0, NOT A STATEMENT. This is the whole
 * build. The biggest faceless numerology short observable in this category is a
 * flat card with a lookup table — 3M views from a 13.6K-subscriber channel;
 * two more faceless cards did 2.6M and 1.3M. Every faceless winner puts a
 * complete, copyable artefact on screen immediately. Our format put a STATEMENT
 * there, which is finished the moment it is read. `KineticScene.table` was
 * added for this and is optional, so V43/V44 (the controls) and V45–V47 (the
 * held package) still render byte-for-byte as published.
 *
 * ⭐⭐ 2. A CLAIM, NEVER A QUESTION. V47's curve: 44.9% lost inside second 1,
 * then 60.1% OF THE SURVIVORS inside second 2 — 78% gone by 2s. "What is your
 * first letter worth?" is answerable in the viewer's head as "probably nothing"
 * and is answered DURING second 1: the loop closes on schedule and they scroll.
 * A stated claim cannot be resolved that way. Frame 0 here has no question mark
 * in it, on purpose.
 *
 * ⭐ 3. SOMETHING MUST PHYSICALLY MOVE THAT IS NOT TEXT. A card that animates
 * only its own words has no visual proposition — the sentence and the picture
 * are the same object, so the viewer is waiting on their own reading speed with
 * nothing to look at. Here a ROW lights at 1.9s, a COLUMN at 6.9s, and the one
 * CELL where they cross at 8.6s. ⛔ Never a face: the owner's is dead-tested at
 * ~700 views against faceless winners at 1,268–2,408.
 *
 * ⭐ 4. THE CTA IS A SAVE. Comments are dead — 35 across 61 posts and **0 on 24
 * of the last 25**, despite a comment CTA in nearly every caption. Saves-per-
 * reach is the one rising signal (0.95% in the winning era -> 1.29% now, while
 * reach fell ~8x). A screenshot IS a save, and the artefact is the thing worth
 * screenshotting.
 *
 * ⛔ 5. NO PRICE ON SCREEN. The two posts that named the ₹354 price are the two
 * lowest-reach posts in the entire 61-post window (111 and 151).
 *
 * ── WHERE EVERY FACT ON SCREEN COMES FROM ───────────────────────────────────
 * ⛔ NOTHING HERE IS INVENTED. Checked against the engine and the knowledge base
 * in `vedic-numerology` on 2026-08-27:
 *
 *   • `modules/numerology-engine/core.ts:4-6` — the birth-day number is the DAY
 *     reduced to one digit. 23 -> 2+3 -> 5.
 *   • `core.ts:11-19` — the whole-date number sums every digit of day, month
 *     and year and reduces. 23·4·1990 -> 2+3+4+1+9+9+0 = 28 -> 10 -> 1.
 *   • `lib/knowledge/seed-data/driver-conductor-combos.ts` +
 *     `tests/knowledge/driver-conductor-combos.test.ts` — **exactly 81 entries,
 *     every (1..9)x(1..9) pair once, each with written interpretation.** It is
 *     the ONLY category in the knowledge base with prose behind it (81 of 81
 *     entries, one source).
 *
 * 🪤 AND WHAT WAS CHECKED AND REFUSED, so nobody re-proposes it:
 *   • **Planes** ("an empty row of the grid means X") — `rulesets/v1.ts` has
 *     `planes: []`. The data is deliberately empty. Unsupported.
 *   • **Arrows** (MARS_MERCURY, SUN_SATURN, MARS_RAHU_BANDHAN, 18 named rules) —
 *     the patterns exist in `arrows.ts`, the interpretation text does not.
 *     Zero knowledge rows are tagged with an arrow. Writing their meanings
 *     would be inventing numerology.
 *
 * ⚠️ WOUND, NOT ACCUSATION — standing rule. Nothing here tells anyone their
 * number is wrong, and no outcome is predicted. The gap is placed on what the
 * viewer was SHOWN ("the half nobody shows you"), never on the viewer. The 81
 * combination readings do carry outcome language; none of it is on screen.
 *
 * 🔴 FRAME 0 KEEPS `dawn-a`, AND THAT NEEDS ITS RECEIPT. V43/V44 opened on
 * 99.5% identical pixels and V44's 1s hold halved, so re-showing a frame is a
 * real cost. Measured over all 13 grounds, dawn-a is the only one above mean
 * luma 40 (115.0 / stddev 77.3; next is stone-a at 38.5, then everything else
 * is under 35) — and the diagnosed 0–1s killer on this account is a "dark,
 * low-contrast, near-static" opener that reads as NOT A VIDEO. So the ground is
 * held and the FRAME is changed by the thing V47 did not have: a 9x9 grid over
 * two thirds of it. Frame 0 measured 40.1% identical to V47's, against the
 * 99.5% that did the damage.
 */

/** ⭐ The chip is package, not episode. Plain words, no jargon. */
export const KICKER = "VEDIC NUMEROLOGY";

const AXIS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * The worked example the whole cut runs on: 23 April 1990.
 * Birth day 23 -> 5 (the ROW). Whole date 2+3+4+1+9+9+0 = 28 -> 10 -> 1 (the
 * COLUMN). 🪤 If either number is ever edited, edit BOTH the arithmetic on
 * screen and these indices — `v48.test.ts` recomputes them from the engine's
 * rules and will fail if they drift apart.
 */
export const EXAMPLE_ROW = 4; // birth-day number 5, zero-indexed
export const EXAMPLE_COL = 0; // whole-date number 1, zero-indexed

/**
 * 🪤 A FRESH ARRAY EVERY CALL. Scenes must not share a mutable `cells`, or
 * marking the payoff cell would silently mark it in frame 0 too — which is the
 * one place the answer may not appear.
 */
const cells = (pair?: string): string[][] => {
  const g = AXIS.map(() => AXIS.map(() => "·"));
  if (pair) g[EXAMPLE_ROW][EXAMPLE_COL] = pair;
  return g;
};

const artefact = (opts: {
  highlight?: KineticTable["highlight"];
  pair?: string;
}): KineticTable => ({
  colTitle: "WHOLE DATE",
  rowTitle: "BIRTH DAY",
  cols: AXIS,
  rows: AXIS,
  cells: cells(opts.pair),
  highlight: opts.highlight,
});

export const V48_SCENES: KineticScene[] = [
  // ── FRAME 0. A CLAIM, AND THE ARTEFACT ALREADY ON SCREEN. ────────────────
  //    ⛔ No question mark, and no highlight — the poster frame is drawn
  //    static and nothing on it may animate. The grid is legible but the
  //    COLUMN axis is unexplained, which is the loop: the viewer can find
  //    their row in their head and cannot find their column.
  //    🔴 Cream on `heavy`, never ink on pale — every scrim darkens downward,
  //    so dark type on dawn decays to 1.4:1 against a 3.0:1 floor.
  {
    seconds: 1.9,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF6EA",
    accent: "#F4CE8E",
    kicker: KICKER,
    headline: "YOUR BIRTH DAY IS ONLY HALF YOUR NUMBER",
    table: artefact({}),
  },
  // ── The half they already have, paid at 1.9s, and the ROW LIGHTS. Never
  //    coy about the thing it opened on. ────────────────────────────────────
  {
    seconds: 1.7,
    bg: "night-a",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: "THE DAY IS THE FIRST HALF",
    sub: "born on the 23rd? 2 + 3 = 5",
    table: artefact({ highlight: { row: EXAMPLE_ROW } }),
  },
  // ── The second half named, and the gap placed on what the viewer was
  //    SHOWN. ⚠️ Wound, not accusation: never "you got it wrong". ───────────
  {
    seconds: 1.5,
    bg: "stone-a",
    fg: "#EDEDED",
    accent: "#B9B9B9",
    headline: "THE OTHER HALF IS THE WHOLE DATE",
    sub: "the half nobody shows you",
  },
  // ── The copyable procedure. ⭐ This is the mechanic of the 749K short: the
  //    arithmetic itself, on screen, on a date the viewer can swap for their
  //    own. No table here on purpose — the frame changes shape, so the grid's
  //    return at 6.9s reads as an event.
  {
    seconds: 1.8,
    bg: "water-a",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "23 · 4 · 1990",
    sub: "2+3+4+1+9+9+0 = 28 · 2+8 = 10 · 1+0 = 1",
  },
  // ── THE SECOND COORDINATE, at 6.9s — past the 6.4s distribution gate and
  //    still withholding. The COLUMN LIGHTS. ─────────────────────────────────
  {
    seconds: 1.7,
    bg: "violet-a",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    headline: "THAT IS YOUR COLUMN",
    sub: "the day only gave you a row",
    table: artefact({ highlight: { col: EXAMPLE_COL } }),
  },
  // ── THE PAYOFF, scene index 5, at 8.6s — 70% of the runtime. The two
  //    coordinates cross and ONE CELL LIGHTS.
  //    ⛔ The count stays a WORD. V43 put "4 NUMBERS" on screen in a video
  //    whose answer was 1, 2, 4 and 7 and handed the viewer a wrong answer;
  //    here the row and column are numerals, so the count must not be.
  {
    seconds: 1.9,
    bg: "gold-b",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    headline: "THERE ARE EIGHTY-ONE BOXES",
    sub: "and exactly one of them is yours",
    table: artefact({ highlight: { row: EXAMPLE_ROW, col: EXAMPLE_COL }, pair: "5·1" }),
  },
  // ── CTA — A SAVE, NOT A COMMENT, with the artefact still on screen so there
  //    is something to save. ⛔ Never a bare URL: 45% of views arrive from the
  //    Reels tab, muted, where nothing is clickable. 🪤 `ember-b` not another
  //    brown silk after gold-b — the eye reads that boundary as no cut at all.
  {
    seconds: 1.8,
    bg: "ember-b",
    scrim: "normal",
    fg: "#FFF0E6",
    accent: "#FF8A4C",
    headline: "Screenshot the grid",
    sub: "find your box · @numevix",
    table: artefact({ highlight: { row: EXAMPLE_ROW, col: EXAMPLE_COL }, pair: "5·1" }),
  },
];

/** The scene at which the loop closes. Everything before it withholds. */
export const V48_PAYOFF_INDEX = 5;
