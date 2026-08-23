import type { KineticScene } from "./scenes";

/**
 * V44 — NAME NUMBER, episode 1 (the letters that carry 1).
 *
 * ⭐ THIS IS A ONE-VARIABLE CHANGE. V43 changed format + structure + angle +
 * length at once and is therefore uninterpretable as a format test. V44 holds
 * the kinetic package EXACTLY: the same 13 scenes, the same per-scene seconds
 * (22.656s total), the same background order, the same bed. What changes is the
 * CATEGORY and the CTA. ⛔ Do not "improve" the timing or the grounds here — the
 * whole point is that V43 is the control.
 *
 * 📊 WHY THE CATEGORY CHANGED, AND WHY NOT TO CAREERS.
 * Measured 2026-08-22 off the live grids:
 *   @soulguidance_tanishve (25.7K followers, ~100K median) ran OUR EXACT SERIES
 *   — Moolank 1→9 Love Compatibility — in the same month, 37.6K–96.9K a post.
 *   Repeating one claim nine times is survivable; that was never our problem.
 *   @numberswithrimzim's careers posts run 9.6K–11K against 52K–58K for her
 *   partner posts. ⛔ "Careers is the open lane" is FALSE and is not the answer.
 * The one measured mechanism that produces a >30×-follower breakout is a SEND:
 * her 10.1M post is "'SH' in names — tag them below". A name letter is
 * recognised in under a second, and you instantly know someone ELSE's too.
 * That is what this category buys and compatibility never could.
 *
 * 🎯 JUDGE THIS ON PROFILE VISITS PER VIEWER (baseline 1.47% account-wide, V43
 * scored 0%), and on tags. ⛔ NOT on views — 34 of the last 38 posts land at
 * ~200 regardless, so judging on views guarantees a false negative. The funnel,
 * measured over 30 days: 9,493 viewers → 140 profile visits → 17 link taps.
 * Reach is not the broken step; this is.
 *
 * ⚠️ WOUND, NOT ACCUSATION — load-bearing here. Name-number content slides very
 * easily into "your name is wrong, change it", which is both extractive and the
 * exact thing the Ethics workstream exists to prevent. Nothing in this cut tells
 * anyone their name is a mistake. A name that disagrees with the birth number is
 * stated as TWO PULLS, never as a fault, and the fix is never named.
 */

/**
 * The Chaldean letter values. This is a REFERENCE TABLE, not a claim about a
 * reader — it is the same mapping `moolank-data.ts` names at the top of the
 * file. 🪤 Chaldean, NOT Pythagorean: the two disagree, informed viewers will
 * say so in the comments, and the video says which system it is using on screen.
 * ⛔ 9 is deliberately absent. No letter carries 9 in this system, and that
 * absence is episode 9's payoff — do not "fix" it by adding one.
 */
const CHALDEAN: Record<number, string[]> = {
  1: ["A", "I", "J", "Q", "Y"],
  2: ["B", "K", "R"],
  3: ["C", "G", "L", "S"],
  4: ["D", "M", "T"],
  5: ["E", "H", "N", "X"],
  6: ["U", "V", "W"],
  7: ["O", "Z"],
  8: ["F", "P"],
};

const N = 1;
const LETTERS = CHALDEAN[N];
if (!LETTERS) throw new Error(`No Chaldean letters for ${N}`);

/** ⛔ SPELLED, NEVER A NUMERAL. V43's first render put "4 NUMBERS" on screen in
 *  a video whose answer was 1, 2, 4 and 7 — the typography handed the viewer a
 *  wrong answer. A bare "5" here would collide with the letter count the same
 *  way. Found by watching the render; no test caught it. */
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const COUNT_WORD = (WORDS[LETTERS.length] ?? String(LETTERS.length)).toUpperCase();

/** The series chip. ⭐ CHANGE THIS EACH CYCLE, not the claim inside it. */
export const KICKER = `NAME NUMBER · MOOLANK ${N}`;

/** Born 1st, 10th, 19th, 28th — the days that reduce to 1. Derived, not typed. */
const DAYS = [1, 10, 19, 28].filter((x) => ((x - 1) % 9) + 1 === N);
const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

/** The letter the CTA asks the viewer to tag. It MUST be one of this episode's
 *  own letters, or the ask contradicts the video. */
const TAG_LETTER = LETTERS[2] ?? LETTERS[0];

export const V44_SCENES: KineticScene[] = [
  // ── The hook. Birthdate cue first, and no answer anywhere on screen. ─────
  {
    seconds: 1.9,
    bg: "gold-a",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    kicker: KICKER,
    headline: `BORN ${DAYS.map(ordinal).join(", ").replace(/, ([^,]*)$/, " OR $1")}?`,
  },
  // ── The premise. Most viewers have never heard this. ─────────────────────
  {
    seconds: 2.0,
    bg: "night-a",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: "YOUR NAME",
    sub: "has a number too",
  },
  // ── THE LOOP. The count is given; WHICH five is withheld until 17.6s. ────
  {
    seconds: 1.8,
    bg: "stone-a",
    fg: "#EDEDED",
    accent: "#B9B9B9",
    headline: `${COUNT_WORD} LETTERS`,
    sub: "carry the Sun, the way you do",
  },
  // ── Why the Sun, for a 1. Same line the belief-correction winners used. ──
  {
    seconds: 1.9,
    bg: "gold-b",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    kicker: "RULED BY THE SUN",
    headline: "It never shares",
    sub: "the sky",
  },
  // ── The stake, half one. ─────────────────────────────────────────────────
  {
    seconds: 1.9,
    bg: "water-a",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "If your name begins",
    sub: "with one of those five",
  },
  {
    seconds: 1.7,
    bg: "water-b",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "your name and your birth date",
    sub: "pull the same way",
  },
  // ── The stake, half two. ⚠️ Stated as two pulls. Never as a fault. ───────
  {
    seconds: 1.5,
    bg: "ember-a",
    fg: "#FFF0E6",
    accent: "#FF8A4C",
    headline: "If it doesn't",
    sub: "you carry two",
  },
  {
    seconds: 1.5,
    bg: "ember-b",
    fg: "#FFF0E6",
    accent: "#FF8A4C",
    headline: "That is not a fault",
    sub: "it is two pulls, not one",
  },
  // ── Name the system on screen. Chaldean and Pythagorean disagree, and a
  //    paid product cannot afford to be vague about which one it uses. ──────
  {
    seconds: 1.5,
    bg: "violet-a",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    kicker: "CHALDEAN VALUES",
    headline: "Most people",
    sub: "have never checked",
  },
  {
    seconds: 1.9,
    bg: "violet-b",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    headline: "So here they are",
    sub: "the letters of the Sun",
  },
  // ── THE PAYOFF, scene index 10, at 17.6s. The loop opened at 3.9s. ───────
  {
    seconds: 1.5,
    bg: "night-b",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: LETTERS.join(" · "),
  },
  {
    seconds: 1.8,
    bg: "gold-c",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    headline: "Does your name",
    sub: "start with one of them?",
  },
  // ── CTA. Two asks, one scene.
  //    The TAG is the distribution lever: the only measured mechanism in this
  //    niche that produces a >30×-follower breakout is a send to a NAMED person,
  //    and a name letter is the one cue you already know about someone else.
  //    The PROFILE is the business lever: 98.5% of viewers never tap through,
  //    and V43 converted 0 of 157. ⛔ "numevix.com" alone was that CTA — a URL a
  //    muted viewer cannot click. Ask for the profile instead. ────────────────
  {
    seconds: 1.7,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF4E6",
    accent: "#F0C88A",
    headline: `Tag someone whose name starts with ${TAG_LETTER}`,
    sub: "@numevix · free chart in bio",
  },
];

/** The scene at which the loop closes. Everything before it withholds. */
export const V44_PAYOFF_INDEX = 10;
