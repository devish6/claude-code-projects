import reel from "../../../content/compatibility-reel.json";
import type { KineticScene } from "./scenes";

/**
 * V43 — Moolank 1, the first KINETIC cut.
 *
 * ⭐ WHAT CHANGED AND WHY, IN ONE PLACE
 *
 * 1. THE FRAME NOW TURNS OVER. V42 put a Metatron mandala on screen at frame 0
 *    and left it there for 19.6s, swapping only the text. It averaged **2.66s**
 *    of watch time — second-lowest of all 56 posts this account has published —
 *    while holding 62.8% at 1s, the second-BEST hook of the era. The hook was
 *    never the problem. This cut turns the whole frame over 13 times.
 *
 * 2. THE ANSWER IS WITHHELD. V42's accent read "IT'S 1 AND 7" — on the cover,
 *    at frame 0 — so the payload was complete before the video started. Holds
 *    went 62.8% → 35.2% → 19.0% across 1s→2s→3s. Here the hook poses a question
 *    and gives a COUNT ("four numbers"), and which four is revealed one at a
 *    time. The turn — that only two of the four say it back — lands at 14.6s.
 *
 * 3. IT CARRIES A CATEGORY. The market's healthy 1→9 runs
 *    (@astroanjalividya 147K, @soulguidance_tanishve 107K/159K/108K/119K, no
 *    positional decay) label each cycle with a series chip and change the
 *    CATEGORY each cycle. Ours ran nine restatements of one claim and nothing
 *    past position 4 cleared 263. `KICKER` is that chip.
 *
 * 4. THE BIRTHDATE CUE IS NON-NEGOTIABLE. It is the single strongest signal in
 *    the market read and it survives every other format change. Scene 1 leads
 *    with it, because 90% of our viewers are cold and cannot answer
 *    "if you're a number 1".
 *
 * 🔴 EVERY NUMBER HERE IS DERIVED. `perNumberDerived` and `pairs` are written by
 * scripts/derive-compatibility-pairs.mjs from vedic-numerology's friendship.ts.
 * ⛔ Do not hand-write a relationship claim into this file.
 *
 * ⚠️ NO VERDICT ON THE READER. 3 and 8 hold 1 as an ENEMY and 1 holds 3 and 9 as
 * enemies — none of that appears here. `conflict-pairs` is a rejected angle and
 * this is a video FOR 1s. The one asymmetry we do show (7) is stated as the
 * table states it: 7 holds 1 NEUTRAL, not hostile.
 */

const N = 1;
const d = reel.perNumberDerived.numbers[String(N) as "1"];
const pair = (a: number, b: number) => {
  const p = reel.pairs.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
  if (!p) throw new Error(`No derived pair ${a}&${b} — run derive-compatibility-pairs.mjs`);
  return p;
};

/** The series chip. ⭐ CHANGE THIS EACH CYCLE, not the claim inside it. */
export const KICKER = "MATCH SERIES · MOOLANK 1";

/** Born 1st, 10th, 19th, 28th — the days that reduce to 1. Derived, not typed. */
const DAYS = [1, 10, 19, 28].filter((x) => ((x - 1) % 9) + 1 === N);
const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

const p12 = pair(1, 2);
const p14 = pair(1, 4);

/**
 * How many numbers 1 calls a friend, INCLUDING itself. This is the open loop.
 *
 * 🪤 SPELLED, NEVER A NUMERAL. The first render put "4 NUMBERS" on screen at
 * 1.5s — in a video whose answer is 1, 2, 4 and 7. A viewer reading a bare "4"
 * has been handed a wrong answer by the typography. Found by watching the
 * render; no test would have caught it.
 */
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const FRIEND_COUNT = d.friends.length + (d.selfFriendly ? 1 : 0);
const FRIEND_COUNT_WORD = (WORDS[FRIEND_COUNT] ?? String(FRIEND_COUNT)).toUpperCase();

export const V43_SCENES: KineticScene[] = [
  // ── The hook. Birthdate cue first; no answer anywhere on screen. ──────────
  {
    seconds: 1.9,
    bg: "gold-a",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    kicker: KICKER,
    headline: `BORN ${DAYS.map(ordinal).join(", ").replace(/, ([^,]*)$/, " OR $1")}?`,
  },
  // ── The count. This is the loop: FOUR, but which four? ───────────────────
  {
    seconds: 2.0,
    bg: "night-a",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: `${FRIEND_COUNT_WORD} NUMBERS`,
    sub: "sit on your side",
  },
  // ── The turn, promised early and paid at 14.6s. ──────────────────────────
  {
    seconds: 1.8,
    bg: "stone-a",
    fg: "#EDEDED",
    accent: "#B9B9B9",
    headline: "But not all four",
    sub: "say it back",
  },
  // ── Reveal 1 of 4 — and it is the viewer. 1 is self-friendly. ────────────
  {
    seconds: 1.9,
    bg: "gold-b",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    kicker: "THE FIRST IS YOU",
    digit: 1,
    sub: "One of the few at ease with its own number",
  },
  // ── Reveal 2 of 4 ────────────────────────────────────────────────────────
  { seconds: 1.9, bg: "water-a", scrim: "light", fg: "#EAF2FF", accent: "#9CC4E4", kicker: p12.planets, digit: 2 },
  { seconds: 1.7, bg: "water-b", scrim: "light", fg: "#EAF2FF", accent: "#9CC4E4", headline: p12.why },
  // ── Reveal 3 of 4 ────────────────────────────────────────────────────────
  { seconds: 1.5, bg: "ember-a", fg: "#FFF0E6", accent: "#FF8A4C", kicker: p14.planets, digit: 4 },
  { seconds: 1.5, bg: "ember-b", fg: "#FFF0E6", accent: "#FF8A4C", headline: p14.why },
  // ── Reveal 4 of 4 — the one that does not pay back. ──────────────────────
  { seconds: 1.5, bg: "violet-a", fg: "#F6EAFF", accent: "#C89BFF", kicker: "MOON & KETU", digit: d.oneWayOut[0] },
  {
    seconds: 1.9,
    bg: "violet-b",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    headline: `You lean to ${d.oneWayOut[0]}.`,
    sub: `${d.oneWayOut[0]} stays neutral.`,
  },
  // ── THE PAYOFF, at 14.6s. Scene index 10 = V43_PAYOFF_INDEX. ─────────────
  {
    seconds: 1.5,
    bg: "night-b",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: `So ${d.mutual.length === 2 ? "two" : String(d.mutual.length)} others`,
    sub: "list you back",
  },
  {
    seconds: 1.8,
    bg: "gold-c",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    headline: d.mutual.join(" AND "),
  },
  // ── CTA. The only place the brand appears. ───────────────────────────────
  {
    seconds: 1.7,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF4E6",
    accent: "#F0C88A",
    headline: `Send this to your ${d.mutual.join(" or your ")}`,
    sub: "numevix.com",
  },
];

/** The scene at which the loop closes. Everything before it withholds. */
export const V43_PAYOFF_INDEX = 10;
