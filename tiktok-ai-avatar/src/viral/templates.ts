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
   * worse than not snapping at all. Snapped onto `starlightV03`'s map in
   * content/beat-maps.json. Total 18.455s.
   *
   * 🔴🔴 CYCLE 1 REACHED THIS TEMPLATE LAST. It was {1.747, 5.146, 8.565,
   * 2.997} — a payload at frame 207, i.e. **6.9 SECONDS**, from the editorial
   * intent {1.6, 5.4, 8.6, 2.8} of the era whose whole premise the 0–1s
   * retention data killed. `VIRAL_TIMING` and `STRUCTURES` were both moved to
   * a 2.0s payload; this hand-authored template was the ONE composition the
   * change missed, and it is the only thing that was still failing
   * `checkPayloadTiming` once the retired videos stopped emitting.
   *
   * Re-derived, not tidied: `starlightV03`'s beats sit ~0.43s apart, so
   * **`build` is now literally ONE beat** (0.426) — exactly the contract
   * VIRAL_TIMING states. Payload lands frame 52 (1.747s), inside the 60-frame
   * ceiling. `value` absorbs every frame the build gave up, so `valueEnd`
   * stays on its beat at 15.458s and **the total is unchanged at 18.455s** —
   * duration is the strongest signal a duplicate detector has, and this is
   * still one change: the boundaries move, the length does not.
   *
   * ⚠️ These numbers are bed-specific. CHANGE THE BED AND THEY MUST BE
   * RE-DERIVED — `timing.test.ts` fails if they no longer land on a beat.
   */
  structure: { hook: 1.321, build: 0.426, value: 13.711, cta: 2.997 },
  palette: "sage-gold",
  layout: "centered",
};

/**
 * Moolank 4 — best match. **The first video built by the content team**, and the
 * first on an APPROVED angle.
 *
 * ⭐⭐⭐ ANGLE: `best-match`, not `trait-per-number`. `pickAngle` returns it
 * unprompted against the real ledger, and it is the largest effect we have ever
 * measured — compatibility posts took 51.9K–57.2K on an account whose other
 * posts did 6.8K–25.9K. Every V-series video before this one was
 * trait-per-number, which our own numbers mark REJECTED (~205 TikTok views,
 * 122–213 IG reach). The composition did not have to change to carry it: a
 * ViralVideo is a number plus four bullets, and what fills the bullets is the
 * angle.
 *
 * 🔴 EVERY NUMBER CLAIM IS DERIVED, NONE AUTHORED. `1&4` and `4&8` are the
 * mutual pairs from our own friendship.ts via
 * scripts/derive-compatibility-pairs.mjs (mutual = both rows list the other,
 * which is why 1&7 and 2&9 are absent despite reading as pairs in one
 * direction). 4=Rahu, 1=Sun, 8=Saturn come from moolank-cards.json. ⛔ Never
 * lift a pair from competitor copy — of the pairs popular posts cite, only 4&9
 * overlaps with our ruleset.
 *
 * ⚠️ THE LAST BULLET IS LOAD-BEARING, NOT FILLER. Roughly two thirds of viewers
 * will not find their own pair here, and a video that implies their actual
 * partner is a "no" delivers a verdict ON the reader — the same thing that got
 * the conflict frame rejected and drew a top-liked sceptic's comment on the
 * post we studied. "Zaroori nahi ki 'no'" is the Hinglish of the reel's
 * `EASE_LINE`.
 *
 * 🌐 HINGLISH IN ROMAN SCRIPT, by the owner's decision of 2026-08-09, which
 * revises "English everywhere" FOR THIS SERIES ONLY. The binding reason for
 * that rule was ElevenLabs credits on re-narration, and **the V-series has no
 * narration at all** — it is on-screen text over a music bed, so a language
 * change here costs nothing. Roman script also keeps Cinzel/Inter, which carry
 * no Devanagari and would render Hindi as tofu boxes.
 *
 * ⚠️ Structure is PRE-SNAPPED to `cipherV15`'s tracked beats. Frames
 * **40 / 53 / 503 / 593**. cipherV15 was the WORST payload overshoot in the
 * pool (2.20s) before the ceiling landed; it now pays out at frame 53 = 1.77s.
 *
 * 🪤 `value` and `cta` READ AS ROUND (15.0 / 3.0) AND ARE NOT. 503 and 593 are
 * real tracked beats that happen to sit on whole seconds; the boundaries either
 * side of them are not. ⛔ Do not "tidy" them, and do not assume the other two
 * can be rounded to match.
 *
 * 🔴 THE FIRST DRAFT ENDED THE VALUE ACT AT FRAME 516 AND THE GATE REFUSED TO
 * RENDER IT — one pair scene came out at 73 frames against the 72-frame
 * `SCENE_CHANGE * 2` ceiling, which is a trait held past 1.2s. Frame 503 is the
 * neighbouring beat that divides into four even pairs (64/64/65/64), one trait
 * each, no stagger. The gate caught this on the very first video authored after
 * it started blocking — it would otherwise have shipped.
 */
export const BEST_MATCH_FOUR: ViralVideoProps = {
  hookText: "NUMBER 4 WAALON KA",
  hookAccent: "BEST MATCH?",
  hookSub: "1 aur 8 — aur kyun",
  variant: "identity",
  number: 4,
  numberLabel: "RAHU · MATCH 1 AUR 8",
  traits: [
    "4 aur 1 — dono ko control chahiye",
    "4 aur 8 — Rahu aur Shani, ek lane",
    "4 aur 4 — khud ke saath bhi easy",
    "Baaki numbers? Zaroori nahi ki 'no'",
  ],
  // 🪤 NO 👇 HERE. CTAEnding draws its own arrow directly under this line, so
  // an arrow in the copy renders TWO of them stacked. Caught by watching the
  // render, not by any test.
  ctaText: "Comment karo M1 / M2 / M4",
  music: MUSIC.cipherV15,
  structure: { hook: 1.333, build: 0.433, value: 15.0, cta: 3.0 },
  palette: "mono",
  /**
   * 🔴 `centered`, NOT the `stack` the variation picker offered.
   *
   * Watching the first render decided this. `stack` is "editorial: left-aligned,
   * tight, low" — designed when a value scene held TWO traits in a column. Cycle
   * 1's one-trait-per-scene split leaves it a SINGLE 62px line pinned to the
   * bottom-left of a near-white frame, with roughly 70% of the screen empty for
   * the whole 15s value act. Not a hole like V03's — the frame is never blank —
   * but the same failure the codebase already names: "empty of content".
   * `centered` is what V01 uses, at traitSize 72 with the line on the optical
   * centre.
   *
   * Fingerprint `standard|140|centered|mono` is unused in the 14-day window
   * (V24 is the same structure/tempo/layout on ink-violet, V25 the same palette
   * on snap|150|stack), so the duplicate-detection axis is unaffected.
   */
  layout: "centered",
};

/**
 * The SAME video as BEST_MATCH_FOUR, in English.
 *
 * ⭐ ONE VIDEO, TWO CUTS, SPLIT BY PLATFORM (owner, 2026-08-09): the Hinglish
 * cut goes to **Instagram only, once**; this one carries YouTube, Facebook and
 * TikTok. So it is deliberately identical in every respect except the words —
 * same bed, same act structure, same cuts, same length, same palette and
 * layout. Copy is the only variable.
 *
 * ⚠️⚠️ THIS IS NOT A LANGUAGE TEST, AND MUST NEVER BE READ AS ONE. Language is
 * perfectly confounded with platform: if the Instagram cut wins, that is as
 * easily Instagram as it is Hinglish. Same shape as the ≥6s watch-time rule
 * turning out to be confounded with era, and as "follower count swamps the
 * signal" across accounts. A real language test puts both cuts on the SAME
 * platform, weeks apart.
 *
 * 🔴 Claims are the same DERIVED ones — 1&4 and 4&8 are the mutual pairs from
 * our own friendship.ts; 4=Rahu, 1=Sun, 8=Saturn. Translating must never
 * quietly add a claim: "Rahu aur Shani" is Rahu and Saturn, not a third thing.
 *
 * ⚠️ The last bullet is the reel's `EASE_LINE` and is load-bearing in both
 * languages — two thirds of viewers will not find their own pair, and telling
 * them their partner is a "no" is a verdict ON the reader.
 */
export const BEST_MATCH_FOUR_EN: ViralVideoProps = {
  ...BEST_MATCH_FOUR,
  hookText: "IF YOU'RE A NUMBER 4",
  hookAccent: "BEST MATCH?",
  hookSub: "1 and 8 — here's why",
  numberLabel: "RAHU · MATCH 1 AND 8",
  traits: [
    "4 and 1 — both need control",
    "4 and 8 — Rahu and Saturn, one lane",
    "4 and 4 — easy with itself too",
    // 🪤 26 CHARACTERS, WHICH IS EXACTLY ONE LINE at this size — measured, not
    // guessed. "Not listed? That isn't a no" orphaned the word "no" alone on a
    // second line and "...It is not a no" orphaned "a no", both of which read
    // as a typo on the one bullet that must not be misread. Compressed from the
    // reel's canonical "Not on the list? It doesn't mean no."
    "Not listed doesn't mean no",
  ],
  // 🪤 Still no 👇 — CTAEnding draws its own.
  ctaText: "Comment M1 / M2 / M4",
};

/**
 * Moolank 3 — two 3s. The `self-friendly` angle, and the second video the
 * content team has authored.
 *
 * ⭐⭐ ANGLE: `self-friendly`, returned by `pickAngle` against the real ledger.
 * NOT `best-match` — V30 and V31 both used it on 2026-08-10, which puts it
 * inside the 21-day window. Repeating it would be exactly the structural
 * sameness the window exists to prevent, and "make another one like V30" is a
 * request for the RESULT, not for the same subject twice.
 *
 * 🔴 EVERY CLAIM DERIVED, NONE AUTHORED. 3 lists itself a friend (friendship.ts
 * row 3 is [3,6,9]); 3&6 and 3&9 are mutual pairs from
 * derive-compatibility-pairs.mjs; 3=Jupiter from moolank-cards.json. The
 * "8 numbers yes, 1 no" in the hook sub is the derived count — eight numbers
 * list themselves, 7 does not.
 *
 * ⚠️ THE HOOK ASKS, IT DOES NOT ASSERT. "Two 3s work?" is the compatibility
 * reel's rule — ask WHY/WHETHER-with-an-answer, never "Do you…?", which invites
 * a no and a scroll. The sub supplies the stake immediately so the question is
 * not left hanging for 15s.
 *
 * ⚠️ LAST BULLET IS THE EASE LINE, unchanged from V31 down to the character
 * count. It is load-bearing here for the same reason and one more: this angle
 * singles out a number (7), so without it the video hands every 7 a verdict.
 * ⛔ Never cut it to make room for a fourth pair.
 *
 * ⚠️ Structure and bed are V30's EXACTLY — cipherV15, frames 40/53/503/593,
 * value dividing into 64/64/65/64. That is not laziness: those numbers are
 * tracked beats that already clear the payload ceiling and the 72-frame scene
 * cap, and re-deriving them for a video of identical shape would risk the
 * frame-516 failure that the gate caught on V30's first draft for no gain.
 *
 * 🎨 `ink-violet`, not V30's `mono`. Palette is the one free axis here, and
 * `standard|140|centered|mono` is now spent within the 14-day duplicate window.
 */
export const SELF_FRIENDLY_THREE: ViralVideoProps = {
  ...BEST_MATCH_FOUR,
  hookText: "IF YOU'RE A NUMBER 3",
  hookAccent: "TWO 3s WORK?",
  hookSub: "8 numbers yes — 1 no",
  number: 3,
  numberLabel: "JUPITER · 3, 6 AND 9",
  traits: [
    "3 and 3 — Jupiter twice",
    "3 and 6 — counsel and warmth",
    "3 and 9 — knowing and nerve",
    // 🪤 The same 26 characters as V31. See that template: shorter rewrites
    // orphan the word "no" onto a second line, on the one bullet that must not
    // be misread.
    "Not listed doesn't mean no",
  ],
  // 🪤 Still no 👇 — CTAEnding draws its own.
  ctaText: "Comment M3 / M6 / M9",
  palette: "ink-violet",
};

export const VIRAL_TEMPLATES = {
  "Viral-01-Identity-Seven": IDENTITY_SEVEN,
  "Viral-02-Curiosity-Hidden": CURIOSITY_HIDDEN,
  "Viral-03-Contrarian-Eight": CONTRARIAN_EIGHT,
  "Viral-04-Identity-One": IDENTITY_ONE,
  "Viral-05-Curiosity-Three": CURIOSITY_THREE,
  "Viral-06-Contrarian-Nine": CONTRARIAN_NINE,
  "Viral-07-Contrarian-Thirteen": CONTRARIAN_THIRTEEN,
  "Viral-08-BestMatch-Four": BEST_MATCH_FOUR,
  "Viral-09-BestMatch-Four-EN": BEST_MATCH_FOUR_EN,
  "Viral-10-SelfFriendly-Three": SELF_FRIENDLY_THREE,
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
  // First cover on the best-match angle. Kicker still names the ruling planet
  // so the set reads as one series; the accent carries the payload instead of
  // a trait, because the payload IS the topic now.
  "Viral-08-BestMatch-Four": {
    kicker: "Rahu",
    title: "NUMBER 4 WAALON KA BEST MATCH?",
    accent: "1 AUR 8",
    number: 4,
  },
  // The accent carries the reveal, not the pair — on this angle the surprise
  // IS the count, and "8 YES · 1 NO" is legible at thumbnail size where a list
  // of numbers would not be.
  "Viral-10-SelfFriendly-Three": {
    kicker: "Jupiter",
    title: "IF YOU'RE A NUMBER 3, DO TWO 3s WORK?",
    accent: "8 YES · 1 NO",
    number: 3,
  },
  "Viral-09-BestMatch-Four-EN": {
    kicker: "Rahu",
    title: "IF YOU'RE A NUMBER 4, BEST MATCH?",
    accent: "1 AND 8",
    number: 4,
  },
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
