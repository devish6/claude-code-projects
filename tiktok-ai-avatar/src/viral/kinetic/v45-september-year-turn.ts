import type { KineticScene } from "./scenes";

/**
 * V45 — SEPTEMBER, and the year that does not start in January.
 *
 * 🔴 WHY THIS EXISTS. V44 was a clean one-variable test and the variable was in
 * the WRONG PLACE. Diffed against V43, scene 0's headline was word-for-word
 * identical — "BORN 1ST, 10TH, 19TH OR 28TH?" — same ground, same colours, same
 * 1.9s, same poster frame; only the kicker chip changed. Measured 2026-08-23:
 *
 *   V42 216 views / 62.8% 1s hold · V43 219 / 61.2% · V44 134 / ~42%
 *
 * ⭐⭐⭐ The category changed and the FIRST SECOND did not, and the 1s hold
 * halved. 134 is below the ~200 baseline seeding floor — that is suppression,
 * not sampling noise. A new category behind an old hook reads as a repost of
 * the thing the viewer already skipped.
 * ⇒ [[no recycled content ideas]] binds FRAME 0, not just the idea. Two posts
 * in a row may not open on the same string.
 *
 * ⚖️ THIS CUT BUNDLES TWO FRAME-0 CHANGES ON PURPOSE — a never-posted hook
 * shape and visible motion at frame 1 — so read it as one combined "frame 0 is
 * new" test, NOT as two separable variables. Everything downstream of scene 0
 * is held at V43/V44's package exactly: same 13 scenes, same per-scene seconds,
 * same ground order, same bed, 22.656s. ⛔ Do not "improve" the timing here.
 *
 * 🌍 WHY SEPTEMBER. Measured off the live grids 2026-08-23:
 *   @soulguidance_tanishve (26K) last 8 posts: 232K/170K/150K/123K/118K/99.4K/
 *   93.3K/38.3K — all on a monthly-prediction chip. On 08-22 the same format ran
 *   37.6K–96.9K, so its ceiling moved ~2.4× in a day and 6 of 8 now clear 90K.
 *   The format is COMPOUNDING. ⚠️ But the chip is NOT the mechanism:
 *   @numberswithrimzim ran the same chip over static b-roll and got 29.1K
 *   against tanishve's 93K–232K. What separates them is motion at frame 1.
 *
 * 🔴🔴 WHAT THIS VIDEO MAY NOT CLAIM, AND WHY IT DOES NOT.
 * A moolank-segmented September forecast is NOT DERIVABLE from our engine.
 * `vedic-numerology/lib/numerology/personal-year.ts` anchors a Personal Year to
 * the full DOB, and no universal-month convention exists anywhere in the
 * ruleset. Mapping "September -> 9" and running it through the friendship table
 * would be an AUTHORED system, which is exactly what `assertsFacts: false`
 * forbids and the same class of error as the pratayandar 8-vs-driver bug —
 * generalising a convention from an unverified example.
 * ⇒ So the chip stays and the CLAIM changes. Everything on screen here follows
 * from one line of the engine:
 *
 *   "A Personal Year runs birthday -> birthday, not Jan 1 -> Dec 31 ... before
 *    this year's birthday the person is still in LAST year's number."
 *
 * ⚠️ WOUND, NOT ACCUSATION. The wound is "you have been reading the wrong year
 * for yourself". It is never the viewer's error — scene 7 says so on screen.
 * Nothing here tells anyone their year is bad, and no outcome is predicted.
 *
 * 🎯 JUDGE THIS ON THE 1s HOLD against V43's 61.2% and V44's ~42%. That is the
 * only number this cut is trying to move. ⛔ NOT on views.
 */

/** The month this cut is cut for. ⛔ Re-derive MONTHS_WAITING if this changes. */
const MONTH = 9; // September
const MONTH_NAME = "SEPTEMBER";

/**
 * The birth months whose birthday has NOT yet occurred in the calendar year,
 * as of `MONTH`. Those people are still inside LAST year's Personal Year.
 *
 * 🔴 DERIVED, NEVER TYPED. This is arithmetic on the engine's own rule, not a
 * numerological claim: a birthday in month M has not happened yet when M is
 * strictly after the current month. September itself is EXCLUDED and handled
 * separately — it is mid-turn, so some of it has passed and some has not, and
 * putting it in this list would be false for half the month.
 */
const MONTH_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTHS_WAITING = MONTH_ABBR.filter((_, i) => i + 1 > MONTH);

/** ⛔ SPELLED, NEVER A NUMERAL. V43 put "4 NUMBERS" on screen in a video whose
 *  answer was 1, 2, 4 and 7 — the typography handed the viewer a wrong answer.
 *  A bare "3" here would collide with the month list the same way. */
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const COUNT_WORD = (WORDS[MONTHS_WAITING.length] ?? String(MONTHS_WAITING.length)).toUpperCase();

/** The series chip. ⭐ CHANGE THIS EACH CYCLE, not the claim inside it. */
export const KICKER = `${MONTH_NAME} · 2026`;

export const V45_SCENES: KineticScene[] = [
  // ── The hook. ⭐ A SHAPE THIS ACCOUNT HAS NEVER POSTED: no "BORN [days]?",
  //    no moolank, no birthdate cue. And `push` makes the frame MOVE while the
  //    viewer reads it — rimzim's static-b-roll chip post got 29.1K against
  //    tanishve's 93K–232K, and motion at frame 1 is the visible difference.
  //    🪤 Scene 0 still renders its TYPE static: frame 0 is the poster frame and
  //    has shipped blank twice. The ground moves; the words do not. ────────────
  {
    seconds: 1.9,
    bg: "gold-a",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    push: { from: 1.14, to: 1.0 },
    kicker: KICKER,
    headline: "JANUARY IS NOT YOUR NEW YEAR",
  },
  // ── The rule, stated plainly and early. It is small, and hiding it would
  //    only make the video coy. The LOOP is not the rule; it is the list. ─────
  {
    seconds: 2.0,
    bg: "night-a",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: "YOUR YEAR TURNS",
    sub: "on your birthday, not the 1st",
  },
  // ── THE LOOP OPENS AT 3.9s. The count is given; WHICH months is withheld
  //    until 17.6s. Same structure V44 used for its five letters. ─────────────
  {
    seconds: 1.8,
    bg: "stone-a",
    fg: "#EDEDED",
    accent: "#B9B9B9",
    headline: `${COUNT_WORD} BIRTH MONTHS`,
    sub: "are still inside last year's number",
  },
  {
    seconds: 1.9,
    bg: "gold-b",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    kicker: "PERSONAL YEAR",
    headline: "It runs",
    sub: "birthday to birthday",
  },
  // ── The stake, half one. ─────────────────────────────────────────────────
  {
    seconds: 1.9,
    bg: "water-a",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "If your birthday",
    sub: "has already passed this year",
  },
  {
    seconds: 1.7,
    bg: "water-b",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "you are reading",
    sub: "the right year for yourself",
  },
  // ── The stake, half two. ⚠️ Stated as a calendar, never as a fault. ───────
  {
    seconds: 1.5,
    bg: "ember-a",
    fg: "#FFF0E6",
    accent: "#FF8A4C",
    headline: "If it hasn't",
    sub: "you are still in last year's",
  },
  {
    seconds: 1.5,
    bg: "ember-b",
    fg: "#FFF0E6",
    accent: "#FF8A4C",
    headline: "That is not your mistake",
    sub: "it is a calendar, not a fault",
  },
  {
    seconds: 1.5,
    bg: "violet-a",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    kicker: `AS OF ${MONTH_NAME}`,
    headline: "Most people",
    sub: "have never checked which one",
  },
  {
    seconds: 1.9,
    bg: "violet-b",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    headline: "So here they are",
    sub: "the months still waiting",
  },
  // ── THE PAYOFF, scene index 10, at 17.6s. The loop opened at 3.9s. ───────
  {
    seconds: 1.5,
    bg: "night-b",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: MONTHS_WAITING.join(" · "),
  },
  // ── The timely half, and the reason the chip says September at all. ──────
  {
    seconds: 1.8,
    bg: "gold-c",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    headline: `AND ${MONTH_NAME}`,
    sub: "turns this month",
  },
  // ── CTA. ⭐ POINTS AT THE PAID PRODUCT, not just the bio. The Annual
  //    Forecast is read birthday-to-birthday through the Mahadasha and
  //    Antardasha cycles, so the CTA is the video's own claim, continued —
  //    not a bolted-on ask. ⛔ Never a bare URL: a muted viewer cannot click it.
  {
    seconds: 1.7,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF4E6",
    accent: "#F0C88A",
    headline: "Have your year read birthday to birthday",
    sub: "@numevix · Annual Forecast in bio",
  },
];

/** The scene at which the loop closes. Everything before it withholds. */
export const V45_PAYOFF_INDEX = 10;
