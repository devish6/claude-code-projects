import { MUSIC } from "../lib/brand";
import { HOOK_TEST_SEVEN, type Hook } from "./hooks";
import type { ViralVideoProps } from "./ViralVideo";

/**
 * The three launch templates, one per hook archetype.
 *
 * Copy rules enforced here:
 *  - hook: 5–8 words, contains a number/date/personal reference
 *  - traits: exactly 4, each 3–7 words
 *  - no brand mention before the CTA
 *
 * Content is drawn from the same Ketu/seeker interpretation used by the
 * original 09-WhySeven promo, so claims stay consistent with the live app.
 */

/** IDENTITY — "this is about you" */
export const IDENTITY_SEVEN: ViralVideoProps = {
  hookText: "BORN ON THE 7th, 16th",
  hookAccent: "OR 25th?",
  hookSub: "You have this hidden trait",
  variant: "identity",
  buildSetup: "Number 7s are known for something unusual…",
  buildReveal: "Most people read them completely wrong.",
  number: 7,
  numberLabel: "The Seeker",
  traits: [
    "Ruled by Ketu — detachment",
    "Sees what others miss",
    "Reads people without words",
    "Happy alone, quietly magnetic",
  ],
  ctaText: "Comment your birth date",
  music: MUSIC.violinEnergetic,
};

/** CURIOSITY — knowledge gap */
export const CURIOSITY_HIDDEN: ViralVideoProps = {
  hookText: "MOST PEOPLE CALCULATE",
  hookAccent: "THIS WRONG",
  hookSub: "The number hidden in your birthday",
  variant: "mystery",
  buildSetup: "Your birth date holds two different numbers…",
  buildReveal: "Almost everyone only knows the first one.",
  number: 8,
  numberLabel: "Driver vs Conductor",
  traits: [
    "Birth number = your day",
    "Destiny number = the full date",
    "They can contradict each other",
    "The clash explains a lot",
  ],
  ctaText: "Drop your date — I'll break it down",
  music: MUSIC.trendV02,
};

/** CONTRARIAN — attack the received wisdom */
export const CONTRARIAN_EIGHT: ViralVideoProps = {
  hookText: "NUMBER 8 IS NOT",
  hookAccent: "UNLUCKY",
  hookSub: "You've been told the wrong story",
  variant: "contrarian",
  buildSetup: "Everyone calls 8 the number of struggle…",
  buildReveal: "It's the number of delayed compounding.",
  number: 8,
  numberLabel: "The Builder",
  traits: [
    "Ruled by Saturn — patience",
    "Rewards arrive late, not never",
    "Built for long horizons",
    "Struggle early, scale later",
  ],
  ctaText: "Are you an 8? Comment below",
  music: MUSIC.starlightV03,
};

/**
 * IDENTITY — Moolank 1 (Sun). Traits taken from MOOLANKS[1].strengths so the
 * video cannot drift from what the app and the earlier promos already say.
 */
export const IDENTITY_ONE: ViralVideoProps = {
  hookText: "BORN ON THE 1st, 10th",
  hookAccent: "19th OR 28th?",
  hookSub: "You hate being told what to do",
  variant: "identity",
  buildSetup: "There's a reason authority grates on you…",
  buildReveal: "You were built to be the authority.",
  number: 1,
  numberLabel: "Ruled by the Sun",
  traits: [
    "A natural-born leader",
    "Fiercely independent",
    "Bold, original, driven",
    "Radiates quiet confidence",
  ],
  ctaText: "Are you a 1? Comment your date",
  music: MUSIC.readyV04,
};

/** CURIOSITY — Moolank 3 (Jupiter). The number people assume they want. */
export const CURIOSITY_THREE: ViralVideoProps = {
  hookText: "EVERYONE WANTS TO BE",
  hookAccent: "A NUMBER 3",
  hookSub: "Almost nobody knows why",
  variant: "mystery",
  buildSetup: "3 is called the luckiest number in numerology…",
  buildReveal: "Luck isn't what Jupiter actually gives you.",
  number: 3,
  numberLabel: "Ruled by Jupiter",
  traits: [
    "Wise beyond your years",
    "A natural teacher",
    "Disciplined and ambitious",
    "Optimistic, expansive thinking",
  ],
  ctaText: "Born on the 3rd, 12th, 21st or 30th?",
  // Beat-synced bed: "Volt Slope" is the only track in the pool at 150 BPM,
  // i.e. a 12-frame beat at 30fps, so its hits land on the cuts at frames
  // 48/192/264/336. Replaced MUSIC.perfectMoment, which was an untimed bed.
  music: MUSIC.voltSlope,
};

/**
 * CONTRARIAN — Moolank 9 (Mars). Reframes the "angry 9" cliché.
 * Kept deliberately non-fatalistic: the flip is that the fire is directed,
 * not that the person is dangerous.
 */
export const CONTRARIAN_NINE: ViralVideoProps = {
  hookText: "NUMBER 9 IS NOT",
  hookAccent: "ANGRY",
  hookSub: "That's Mars being misread",
  variant: "contrarian",
  buildSetup: "People call 9s aggressive and impatient…",
  buildReveal: "It's fire with nowhere to go yet.",
  number: 9,
  numberLabel: "Ruled by Mars",
  traits: [
    "Courageous and bold",
    "Relentless energy",
    "A disciplined fighter",
    "A fierce protector",
  ],
  ctaText: "Comment 9 if this is you",
  music: MUSIC.darkCinematic,
};

/**
 * CONTRARIAN — the V03 revival, 2026-08-07.
 *
 * ⭐ V03 ("Number 8 Is Not Unlucky", CONTRARIAN_EIGHT) is the account's best
 * post by 13.6×: 1,924 views, avg watch 7s of 17s, skip rate 57.5% "Lower"
 * against the card reels' 141 / 3s / 90.3% "Higher". Its retention is a slope,
 * not a cliff. This rebuilds that shape on a new topic.
 *
 * 🪤 13 is a DATE, not a moolank — the moolank is 4. V03 never had this
 * mismatch, because its hook number WAS its moolank. So the date list lands on
 * `numberLabel`, at the reveal: the largest frame in the video and the exact
 * beat the myth breaks, rather than being held back to the CTA where everyone
 * born on the 4th, 22nd and 31st would already have scrolled.
 *
 * 🔴 Every fact is from `content/moolank-cards.json` #4. Do not edit this copy
 * without re-checking it there — a previous outside rewrite mis-mapped anger to
 * 8 (anger is Moolank 9; 8 is Saturn).
 *
 * 📐 Structure is CUSTOM, not from `STRUCTURES`. Punchiness is cut density, and
 * no pool structure reproduces V03's rhythm — `standard` stretches trait pairs
 * from 1.70s to 2.03s. Holding value at V03's 8.6s keeps the cadence frame for
 * frame; the length differs via build and cta so the render cannot collide with
 * the retired 17.450667s duplicate fingerprint.
 * ⭐⭐ Do NOT shorten the value act to make it feel faster — below ~8.3s
 * `makeValueScenes` drops from three pair scenes to two and stretches each past
 * 2.1s, which is SLOWER.
 */
export const CONTRARIAN_THIRTEEN: ViralVideoProps = {
  hookText: "NUMBER 13 IS NOT",
  hookAccent: "UNLUCKY",
  hookSub: "You've been scared of the wrong thing",
  variant: "contrarian",
  buildSetup: "Every culture calls 13 the unlucky number…",
  buildReveal: "In Vedic numerology it isn't even its own number.",
  number: 4,
  // 🪤 Kept short deliberately. This renders UPPERCASE at 56px with 4px of
  // letter-spacing, so ~26 characters fill a line; the first draft ran to 45
  // and was clipped off both edges of the frame.
  numberLabel: "1+3=4 · also the 4th, 22nd, 31st",
  traits: [
    "Rahu rules every one of them",
    "A shadow point, not a planet",
    "Luck arrives suddenly — and leaves",
    "Sharp, restless, a natural researcher",
  ],
  ctaText: "Born on the 4th, 13th, 22nd or 31st? 👇",
  music: MUSIC.starlightV03,
  /**
   * 🔴 PRE-SNAPPED TO THE BED'S TRACKED BEATS. These are NOT round numbers and
   * must not be tidied into any.
   *
   * `snapActsToBeats` only runs pipeline-side (scripts/), so a hand-authored
   * template's ACT boundaries never pass through it — they would sit 55–147ms
   * off the beat while the value act's internal cuts were snapped, which is
   * worse than not snapping at all. Derived from the editorial intent
   * {1.6, 5.4, 8.6, 2.8} snapped onto `starlightV03`'s map in
   * content/beat-maps.json. Total 18.455s.
   *
   * ⚠️ These numbers are bed-specific. CHANGE THE BED AND THEY MUST BE
   * RE-DERIVED — `timing.test.ts` fails if they no longer land on a beat.
   */
  structure: { hook: 1.747, build: 5.146, value: 8.565, cta: 2.997 },
  palette: "sage-gold",
  layout: "centered",
};

export const VIRAL_TEMPLATES = {
  "Viral-01-Identity-Seven": IDENTITY_SEVEN,
  "Viral-02-Curiosity-Hidden": CURIOSITY_HIDDEN,
  "Viral-03-Contrarian-Eight": CONTRARIAN_EIGHT,
  "Viral-04-Identity-One": IDENTITY_ONE,
  "Viral-05-Curiosity-Three": CURIOSITY_THREE,
  "Viral-06-Contrarian-Nine": CONTRARIAN_NINE,
  "Viral-07-Contrarian-Thirteen": CONTRARIAN_THIRTEEN,
} as const;

/**
 * Swap only the hook on an existing video.
 *
 * This is the whole point of fixing the act structure: an A/B pair differs by
 * the first 1.6 seconds and shares every other frame, so a difference in
 * 3-second view rate is attributable to the hook and nothing else.
 */
export const withHook = (base: ViralVideoProps, hook: Hook): ViralVideoProps => ({
  ...base,
  hookText: hook.text,
  hookAccent: hook.accent,
  hookSub: hook.sub,
  variant: hook.variant,
});

/** The ten Moolank-7 hook variants, all on the V01 body. */
export const HOOK_TEST_COMPOSITIONS = Object.fromEntries(
  HOOK_TEST_SEVEN.map((hook, i) => [
    `HookTest-7${String.fromCharCode(65 + i)}-${hook.id.split("-").pop()}`,
    withHook(IDENTITY_SEVEN, hook),
  ]),
) as Record<string, ViralVideoProps>;

/**
 * Cover copy per video. Deliberately shorter than the hook — a thumbnail is
 * read at a glance in a grid, not at full size.
 */
export const VIRAL_COVERS: Record<
  keyof typeof VIRAL_TEMPLATES,
  { kicker: string; title: string; accent: string; number: number }
> = {
  "Viral-01-Identity-Seven": {
    // Kicker names the ruling planet on every single-number cover, so the set
    // reads as one series in a grid.
    kicker: "Ketu",
    title: "BORN ON THE 7th, 16th OR 25th?",
    accent: "YOU'RE A 7",
    number: 7,
  },
  "Viral-02-Curiosity-Hidden": {
    kicker: "Birth Number",
    title: "MOST PEOPLE CALCULATE",
    accent: "THIS WRONG",
    number: 8,
  },
  "Viral-03-Contrarian-Eight": {
    kicker: "Saturn",
    title: "NUMBER 8 IS NOT",
    accent: "UNLUCKY",
    number: 8,
  },
  // Watermark is 4, not 13 — the cover's number is the MOOLANK, and the whole
  // point of the video is that 13 is not its own number.
  "Viral-07-Contrarian-Thirteen": {
    kicker: "Rahu",
    title: "NUMBER 13 IS NOT",
    accent: "UNLUCKY",
    number: 4,
  },
  "Viral-04-Identity-One": {
    kicker: "The Sun",
    title: "YOU HATE BEING TOLD",
    accent: "WHAT TO DO",
    number: 1,
  },
  "Viral-05-Curiosity-Three": {
    kicker: "Jupiter",
    title: "EVERYONE WANTS TO BE",
    accent: "A NUMBER 3",
    number: 3,
  },
  "Viral-06-Contrarian-Nine": {
    kicker: "Mars",
    title: "NUMBER 9 IS NOT",
    accent: "ANGRY",
    number: 9,
  },
};
