import type { HookVariant } from "./components/ViralHook";

/**
 * The hook library — 50 hooks across 5 categories.
 *
 * COPY RULES (enforced by the test in hooks.test.ts):
 *  - `text` and `accent` are ≤ 22 chars each. At 112px on a 1080px frame,
 *    longer lines wrap to three rows and stop being readable in 1.6 seconds.
 *  - Every hook contains a number, a date, or a direct "you".
 *  - One idea per hook. If it needs a comma to hold two thoughts, it's two hooks.
 *
 * ⚠️ The spec's sixth category — celebrity analysis — is deliberately ABSENT.
 * Publishing numerology claims about named real people invites defamation and
 * likeness exposure and is the one content type that risks the account itself.
 * Do not add it back without a deliberate decision.
 *
 * Moolank birth dates used below (day of month, reduced):
 *   1: 1,10,19,28 · 2: 2,11,20,29 · 3: 3,12,21,30 · 4: 4,13,22,31 · 5: 5,14,23
 *   6: 6,15,24 · 7: 7,16,25 · 8: 8,17,26 · 9: 9,18,27
 */

export type HookCategory =
  | "identity"
  | "knowledge-gap"
  | "comment-bait"
  | "educational"
  | "story";

export type Hook = {
  id: string;
  category: HookCategory;
  /** Drives the hook's colour + entrance weight. */
  variant: HookVariant;
  /** Line 1 — the setup. */
  text: string;
  /** Line 2 — the payoff word, rendered in the accent colour. */
  accent: string;
  /** Small supporting line. May be omitted. */
  sub?: string;
  /** Moolank this hook suits, when it is number-specific. */
  number?: number;
};

// ── 1. PERSONAL IDENTITY — "this is about you" ─────────────────────────────
const IDENTITY: Hook[] = [
  {
    id: "id-1-authority",
    category: "identity",
    variant: "identity",
    text: "BORN ON THE 1st, 10th",
    accent: "19th OR 28th?",
    sub: "You hate being told what to do",
    number: 1,
  },
  {
    id: "id-2-feel-everything",
    category: "identity",
    variant: "identity",
    text: "IF YOU'RE A 2,",
    accent: "YOU FEEL IT FIRST",
    sub: "Before anyone says a word",
    number: 2,
  },
  {
    id: "id-3-explain",
    category: "identity",
    variant: "identity",
    text: "YOU CAN'T LEARN",
    accent: "WITHOUT TEACHING",
    sub: "That's a 3 thing",
    number: 3,
  },
  {
    id: "id-4-rules",
    category: "identity",
    variant: "identity",
    text: "BORN ON THE 4th?",
    accent: "YOU BREAK RULES",
    sub: "Then rebuild them better",
    number: 4,
  },
  {
    id: "id-5-restless",
    category: "identity",
    variant: "identity",
    text: "5s DON'T GET BORED.",
    accent: "THEY OUTGROW IT",
    sub: "Different problem entirely",
    number: 5,
  },
  {
    id: "id-6-everyone-leans",
    category: "identity",
    variant: "identity",
    text: "EVERYONE LEANS ON YOU.",
    accent: "NOBODY ASKS WHY",
    sub: "Venus rules the 6",
    number: 6,
  },
  {
    id: "id-7-room",
    category: "identity",
    variant: "identity",
    text: "BORN ON THE 7th, 16th",
    accent: "OR 25th?",
    sub: "You have this hidden trait",
    number: 7,
  },
  {
    id: "id-8-late",
    category: "identity",
    variant: "identity",
    text: "IF YOU'RE AN 8,",
    accent: "YOU'RE JUST EARLY",
    sub: "Saturn pays on a delay",
    number: 8,
  },
  {
    id: "id-9-underaimed",
    category: "identity",
    variant: "identity",
    text: "9s AREN'T ANGRY.",
    accent: "THEY'RE UNDER-AIMED",
    sub: "Mars needs a direction",
    number: 9,
  },
  {
    id: "id-two-people",
    category: "identity",
    variant: "mystery",
    text: "YOU FEEL LIKE",
    accent: "TWO PEOPLE",
    sub: "Your two numbers disagree",
  },
];

// ── 2. CURIOSITY / KNOWLEDGE GAP ───────────────────────────────────────────
const KNOWLEDGE_GAP: Hook[] = [
  {
    id: "kg-calculate-wrong",
    category: "knowledge-gap",
    variant: "mystery",
    text: "MOST PEOPLE CALCULATE",
    accent: "THIS WRONG",
    sub: "The number hidden in your birthday",
  },
  {
    id: "kg-second-number",
    category: "knowledge-gap",
    variant: "mystery",
    text: "YOUR BIRTH DATE HOLDS",
    accent: "TWO NUMBERS",
    sub: "You probably know one",
  },
  {
    id: "kg-name-vibration",
    category: "knowledge-gap",
    variant: "mystery",
    text: "YOUR NAME CARRIES",
    accent: "A NUMBER TOO",
    sub: "Most people never check it",
  },
  {
    id: "kg-before-you-change",
    category: "knowledge-gap",
    variant: "mystery",
    text: "CHANGING YOUR NAME?",
    accent: "CHECK THIS FIRST",
    sub: "The spelling changes the number",
  },
  {
    id: "kg-missing-number",
    category: "knowledge-gap",
    variant: "mystery",
    text: "THE NUMBER MISSING",
    accent: "FROM YOUR CHART",
    sub: "Absence says as much as presence",
  },
  {
    id: "kg-repeating",
    category: "knowledge-gap",
    variant: "mystery",
    text: "SEEING THE SAME",
    accent: "NUMBER DAILY?",
    sub: "Check your chart before Google",
  },
  {
    id: "kg-year-changes",
    category: "knowledge-gap",
    variant: "mystery",
    text: "YOUR NUMBER CHANGES",
    accent: "EVERY YEAR",
    sub: "Nobody tells you this part",
  },
  {
    id: "kg-3-numbers",
    category: "knowledge-gap",
    variant: "mystery",
    text: "YOU DON'T HAVE ONE",
    accent: "YOU HAVE THREE",
    sub: "Birth, destiny, name",
  },
  {
    id: "kg-clash",
    category: "knowledge-gap",
    variant: "mystery",
    text: "WHEN YOUR NUMBERS",
    accent: "FIGHT EACH OTHER",
    sub: "It explains more than you think",
  },
  {
    id: "kg-everyone-wants-3",
    category: "knowledge-gap",
    variant: "mystery",
    text: "EVERYONE WANTS TO BE",
    accent: "A NUMBER 3",
    sub: "Almost nobody knows why",
    number: 3,
  },
];

// ── 3. INTERACTIVE / COMMENT BAIT ──────────────────────────────────────────
const COMMENT_BAIT: Hook[] = [
  {
    id: "cb-drop-date",
    category: "comment-bait",
    variant: "identity",
    text: "DROP YOUR BIRTH DATE.",
    accent: "I'LL READ IT",
    sub: "No, really — comment it",
  },
  {
    id: "cb-be-honest",
    category: "comment-bait",
    variant: "identity",
    text: "CHECK IF THIS",
    accent: "MATCHES YOU",
    sub: "Be honest in the comments",
  },
  {
    id: "cb-tag-a-7",
    category: "comment-bait",
    variant: "identity",
    text: "TAG SOMEONE WHO",
    accent: "IS DEFINITELY A 7",
    sub: "You already thought of them",
    number: 7,
  },
  {
    id: "cb-guess-mine",
    category: "comment-bait",
    variant: "mystery",
    text: "GUESS MY NUMBER",
    accent: "FROM THESE 4 TRAITS",
    sub: "First correct comment wins",
  },
  {
    id: "cb-which-one",
    category: "comment-bait",
    variant: "identity",
    text: "WHICH ONE ARE YOU?",
    accent: "1, 5 OR 8",
    sub: "Comment the number",
  },
  {
    id: "cb-born-9th",
    category: "comment-bait",
    variant: "identity",
    text: "BORN ON THE 9th,",
    accent: "18th OR 27th?",
    sub: "Comment 9 if this is you",
    number: 9,
  },
  {
    id: "cb-rate-accuracy",
    category: "comment-bait",
    variant: "identity",
    text: "RATE THIS OUT OF 10",
    accent: "FOR ACCURACY",
    sub: "I'll take the criticism",
  },
  {
    id: "cb-send-this",
    category: "comment-bait",
    variant: "identity",
    text: "SEND THIS TO THE",
    accent: "MOST STUBBORN 1",
    sub: "They'll deny it",
    number: 1,
  },
  {
    id: "cb-partner-number",
    category: "comment-bait",
    variant: "mystery",
    text: "COMMENT YOUR NUMBER",
    accent: "AND THEIRS",
    sub: "I'll tell you if it works",
  },
  {
    id: "cb-wrong-about-you",
    category: "comment-bait",
    variant: "contrarian",
    text: "TELL ME WHAT THIS",
    accent: "GOT WRONG",
    sub: "Genuinely — I want to know",
  },
];

// ── 4. EDUCATIONAL (FAST) ──────────────────────────────────────────────────
const EDUCATIONAL: Hook[] = [
  {
    id: "ed-birth-vs-destiny",
    category: "educational",
    variant: "mystery",
    text: "BIRTH vs DESTINY",
    accent: "IN 15 SECONDS",
    sub: "They are not the same number",
  },
  {
    id: "ed-how-to-calc",
    category: "educational",
    variant: "mystery",
    text: "CALCULATE YOUR NUMBER",
    accent: "IN ONE STEP",
    sub: "Just the day you were born",
  },
  {
    id: "ed-nine-planets",
    category: "educational",
    variant: "mystery",
    text: "9 NUMBERS.",
    accent: "9 PLANETS",
    sub: "Here's the whole map",
  },
  {
    id: "ed-why-name",
    category: "educational",
    variant: "mystery",
    text: "WHY YOUR NAME",
    accent: "HAS A NUMBER",
    sub: "Chaldean, in 20 seconds",
  },
  {
    id: "ed-compound",
    category: "educational",
    variant: "mystery",
    text: "COMPOUND NUMBERS",
    accent: "EXPLAINED FAST",
    sub: "The two-digit one in your chart",
  },
  {
    id: "ed-personal-year",
    category: "educational",
    variant: "mystery",
    text: "WHAT A PERSONAL",
    accent: "YEAR ACTUALLY IS",
    sub: "It resets on your birthday",
  },
  {
    id: "ed-friendly-numbers",
    category: "educational",
    variant: "mystery",
    text: "WHICH NUMBERS",
    accent: "ACTUALLY GET ALONG",
    sub: "Find yours in 20 seconds",
  },
  {
    id: "ed-lo-shu",
    category: "educational",
    variant: "mystery",
    text: "THE 3x3 GRID",
    accent: "IN YOUR BIRTH DATE",
    sub: "Lo Shu, explained simply",
  },
  {
    id: "ed-master-numbers",
    category: "educational",
    variant: "mystery",
    text: "11 AND 22 DON'T",
    accent: "REDUCE. HERE'S WHY",
    sub: "Master numbers, quickly",
  },
  {
    id: "ed-read-any-date",
    category: "educational",
    variant: "mystery",
    text: "READ ANY BIRTH DATE",
    accent: "IN 3 STEPS",
    sub: "Steal this method",
  },
];

// ── 5. STORY / TRANSFORMATION ──────────────────────────────────────────────
const STORY: Hook[] = [
  {
    id: "st-spelling",
    category: "story",
    variant: "mystery",
    text: "SHE CHANGED 1 LETTER",
    accent: "THAT'S ALL IT TOOK",
    sub: "Her name number moved",
  },
  {
    id: "st-100-dates",
    category: "story",
    variant: "mystery",
    text: "I READ 100 BIRTH",
    accent: "DATES THIS MONTH",
    sub: "One pattern kept repeating",
  },
  {
    id: "st-same-number",
    category: "story",
    variant: "mystery",
    text: "3 CLIENTS THIS WEEK.",
    accent: "THE SAME NUMBER",
    sub: "And the same complaint",
  },
  {
    id: "st-didnt-believe",
    category: "story",
    variant: "contrarian",
    text: "YOU DON'T BELIEVE",
    accent: "ANY OF THIS",
    sub: "Run your own date first",
  },
  {
    id: "st-why-it-fits",
    category: "story",
    variant: "mystery",
    text: "WHY IT FEELS LIKE",
    accent: "IT'S ABOUT YOU",
    sub: "It usually is. Here's why",
  },
  {
    id: "st-business-name",
    category: "story",
    variant: "mystery",
    text: "HIS BUSINESS NAME",
    accent: "ADDED TO A 4",
    sub: "He renamed it",
  },
  {
    id: "st-argue-every-year",
    category: "story",
    variant: "mystery",
    text: "THEY ARGUED EVERY",
    accent: "SINGLE YEAR",
    sub: "Check your personal year",
  },
  {
    id: "st-late-bloomer",
    category: "story",
    variant: "contrarian",
    text: "NOTHING WORKED",
    accent: "UNTIL HE WAS 40",
    sub: "Classic 8. Saturn is slow",
    number: 8,
  },
  {
    id: "st-what-i-got-wrong",
    category: "story",
    variant: "contrarian",
    text: "WHAT I GOT WRONG",
    accent: "ABOUT NUMBER 4",
    sub: "I owe 4s an apology",
    number: 4,
  },
  {
    id: "st-first-reading",
    category: "story",
    variant: "mystery",
    text: "MY FIRST READING",
    accent: "WAS MY OWN",
    sub: "It was uncomfortable",
  },
];

export const HOOK_LIBRARY: Hook[] = [
  ...IDENTITY,
  ...KNOWLEDGE_GAP,
  ...COMMENT_BAIT,
  ...EDUCATIONAL,
  ...STORY,
];

export const hooksByCategory = (c: HookCategory): Hook[] =>
  HOOK_LIBRARY.filter((h) => h.category === c);

export const hookById = (id: string): Hook | undefined =>
  HOOK_LIBRARY.find((h) => h.id === id);

/**
 * A/B TEST SET — ten hooks for ONE concept (Moolank 7).
 *
 * These are meant to run against each other on the same body, so the only
 * variable is the first 1.6 seconds. Ship 2–3 at a time, a few days apart;
 * posting ten near-identical videos at once trains the algorithm to treat the
 * account as repetitive and splits your own audience across them.
 *
 * Read the 3-second view rate, not likes. Below ~70% the hook is dead — swap
 * it rather than editing the body.
 */
export const HOOK_TEST_SEVEN: Hook[] = [
  {
    id: "t7-a-misunderstood",
    category: "identity",
    variant: "contrarian",
    text: "THE MOST MISREAD",
    accent: "NUMBER IS 7",
    sub: "And it's not close",
    number: 7,
  },
  {
    id: "t7-b-dates",
    category: "identity",
    variant: "identity",
    text: "BORN ON THE 7th, 16th",
    accent: "OR 25th?",
    sub: "You have this hidden trait",
    number: 7,
  },
  {
    id: "t7-c-feel-different",
    category: "identity",
    variant: "mystery",
    text: "WHY 7s ALWAYS",
    accent: "FEEL DIFFERENT",
    sub: "It isn't in your head",
    number: 7,
  },
  {
    id: "t7-d-not-spiritual",
    category: "identity",
    variant: "contrarian",
    text: "NUMBER 7 IS NOT",
    accent: "SPIRITUAL",
    sub: "That's the wrong word",
    number: 7,
  },
  {
    id: "t7-e-watch-this",
    category: "identity",
    variant: "identity",
    text: "BORN ON 7, 16 OR 25?",
    accent: "WATCH THIS",
    sub: "30 seconds, then decide",
    number: 7,
  },
  {
    id: "t7-f-quiet-side",
    category: "identity",
    variant: "mystery",
    text: "THE SIDE OF 7",
    accent: "NOBODY POSTS",
    sub: "Ketu doesn't advertise",
    number: 7,
  },
  {
    id: "t7-g-alone",
    category: "identity",
    variant: "mystery",
    text: "7s AREN'T LONELY.",
    accent: "THEY'RE SELECTIVE",
    sub: "There's a difference",
    number: 7,
  },
  {
    id: "t7-h-birthday-trait",
    category: "identity",
    variant: "identity",
    text: "YOUR BIRTHDAY SHOWS",
    accent: "ONE TRAIT CLEARLY",
    sub: "For 7s it's obvious",
    number: 7,
  },
  {
    id: "t7-i-usually",
    category: "identity",
    variant: "mystery",
    text: "PEOPLE BORN ON",
    accent: "THE 7th USUALLY…",
    sub: "Tell me if this lands",
    number: 7,
  },
  {
    id: "t7-j-truth",
    category: "identity",
    variant: "contrarian",
    text: "NUMBER 7: WHAT",
    accent: "NOBODY TELLS YOU",
    sub: "Said plainly",
    number: 7,
  },
];
