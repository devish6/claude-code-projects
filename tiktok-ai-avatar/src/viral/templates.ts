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

/**
 * Moolank 2 — "not weak". The `belief-correction` angle, third content-team video.
 *
 * ⭐⭐ ANGLE: `belief-correction`, entered as `hypothesis` 2026-08-12. `pickAngle`
 * returned NULL — best-match (V30/V31) and self-friendly (V32/PIN01) are both
 * inside the 21-day window until 2026-09-01 — and null means write a new angle,
 * not ship a repeat. So the angle IS this cycle's one change, by construction.
 *
 * 🪤🪤 THE ANGLE IS NEW TO THE REGISTRY, NOT TO THE ACCOUNT. V03 "Number 8 Is
 * Not Unlucky" (07-14) and V06 "Number 9 Is Not Angry" (07-22) are both on it,
 * and V03 is the best post we have ever made. ⛔ THAT IS ALSO WHY 8 AND 9 ARE
 * OFF THE TABLE — the first draft of this video was "8 is not unlucky", which is
 * V03 verbatim. Check `daily-state.json` for a shipped twin before writing copy;
 * the no-recycled-ideas rule bites hardest on the ideas that worked.
 * ⚠️ V03's 1,924 views are CONFOUNDED WITH ERA (pre-07-24 median reach 1,487).
 * Do not quote them as this angle's warrant — angles.json carries the caveat.
 *
 * 🔴 EVERY CLAIM DERIVED FROM `moolank-cards.json` #2, NONE AUTHORED:
 * "reads a room instantly" and the mood/sensitivity reframe are its
 * `surpriseFact` ("The Moon changes shape nightly. So does a 2's mood — the same
 * sensitivity that lets them read a room instantly"); "strongest in partnership"
 * is `strengths[2]`; "called moody" is `shadow[2]`, quoted as the BELIEF and then
 * corrected, which is the whole shape of this angle. 2 = Moon, born 2nd/11th/
 * 20th/29th, both from the same card.
 *
 * ⚠️ NO EASE LINE HERE, AND ITS ABSENCE IS DELIBERATE. V30/V31/V32 all close on
 * "Not listed doesn't mean no" because they LIST PAIRS and two thirds of viewers
 * will not find theirs. This video lists no pairs, so that line would refer to
 * nothing — a non-sequitur, not a safeguard. The verdict risk it exists to cover
 * is absent for the same reason: the copy singles nobody out. ⛔ Do not paste it
 * back in for consistency with the other three.
 * ⚠️ For the same reason the on-screen CTA drops the M-list. Naming matches on
 * screen WOULD be a pair claim, and would put the ease line back in scope.
 *
 * 📐 STRUCTURE MOVES TO `essay`, AND THAT IS THE EXPERIMENT'S COST, NOT A TIDY-UP.
 * Holding V32's production exactly — the point of a one-change cycle — would have
 * given this video V32's own fingerprint, `standard|140|centered|ink-violet`, two
 * days apart into the same four feeds. That is the precise condition that got the
 * previous TikTok account withheld (28 renders, every one 17.450667s), so one axis
 * HAD to move. Duration is the axis variation.mjs exists to vary, and LONGER was
 * chosen over shorter on purpose: a 23.4s cut penalises this video's completion
 * rate, so a win on reach or shares cannot be explained by the change.
 * 🪤 ⇒ avg watch and completion % are NOT comparable to V32. Reach, share rate
 * and the 0–1s drop are. Palette, bed, layout, payload frame and language all
 * hold, so the angle stays the only content variable.
 *
 * ⚠️ Act boundaries are cipherV15 TRACKED beats, re-derived for the longer total
 * rather than scaled from V30's: payload holds at frame 53 (1.777s — the same
 * beat, so the first two seconds are frame-identical to V32), value ends on the
 * 20.627s beat (619) and the total lands on 23.198s (696), the tracked beat
 * nearest `essay`'s 23.4s. Value is 566 frames, which `makeValueScenes` splits
 * into FIVE scenes — one MORE than the trait count, because four would be 83
 * frames and breach the 72-frame ceiling.
 * 🪤 Those five land at **64/71/70/64/65**, not the 67/67/67/67/64 the even
 * division gives: `snapRun` pulls each boundary onto a tracked cipherV15 beat.
 * 71 is the tightest any shipped scene has run against the 72 ceiling — read
 * from `planViralVideo`, not computed by hand. ⛔ Do not lengthen the value act
 * to "round out" the fifth scene; the next beat out breaches the ceiling.
 */
export const BELIEF_CORRECTION_TWO: ViralVideoProps = {
  ...SELF_FRIENDLY_THREE,
  hookText: "IF YOU'RE A NUMBER 2",
  hookAccent: "NOT WEAK",
  hookSub: "The Moon isn't indecisive",
  number: 2,
  numberLabel: "MOON · 2, 11, 20, 29",
  /**
   * 🔴 FIVE TRAITS, NOT FOUR, AND THE FIFTH IS NOT PADDING. `essay`'s 566-frame
   * value act produces FIVE scenes (four would breach the 72-frame ceiling), and
   * `spreadTraits` deals one trait per scene — so four traits left scene 5 empty
   * and the first render shipped 2.13s of blank screen at 15.5s. `essay` is a
   * longer structure; timing.ts's rule for a longer act is "add SCENES, not
   * seconds", and the honest completion of that is more content.
   * ⛔ Never pad to reach the count. Every line here is still card #2.
   *
   * Order is the angle's shape: name the belief, correct it, evidence it twice,
   * land the reframe LAST. "Sensitivity is the skill" moved from 4th to 5th for
   * that reason — it is the sentence the video exists to deliver, and it now
   * sits on the final scene before the montage.
   */
  traits: [
    // The belief, quoted from shadow[2], then corrected — in that order. Naming
    // it first is what makes the next line land; leading with the correction
    // leaves the viewer arguing with a claim nobody made.
    "Called moody — it's radar",
    "Reads a room instantly",
    "Strongest in partnership",
    // strengths[1], "Warmth and nurturing nature", compressed to one line.
    "Warmth people lean on",
    "Sensitivity is the skill",
  ],
  // 🪤 Still no 👇 — CTAEnding draws its own.
  ctaText: "Comment your birth number",
  structure: { hook: 1.333, build: 0.433, value: 18.861, cta: 2.571 },
};

/**
 * Moolank 7 — "not cold". `belief-correction` AGAIN, and that is the point.
 *
 * ⭐⭐⭐ THIS IS A REPLICATION, NOT A NEW IDEA. V33 measured at 1,268 views /
 * 1,140 viewers ~1.5 days in — the best Instagram post of the post-07-24 era,
 * against V32's 169/137 and V30's 759/644 in the same week and the same era,
 * with Instagram labelling Viewers, avg watch (6.9s) and Follows all "Higher"
 * and skip rate (67.2%) "Lower". But V33 moved TWO things against V32 — angle
 * AND structure — so what it actually measured is the PACKAGE
 * `belief-correction + essay`, at n=1. Holding both here on a different number
 * is what takes it to n=2 and separates the angle from the structure.
 *
 * 🔴 `pickAngle` RETURNED NULL AND WAS DELIBERATELY OVERRIDDEN (owner,
 * 2026-08-12). All three approved angles now sit inside the 21-day window, so
 * with a ~1-day cadence and three angles `pickAngle` returns null in perpetuity
 * and silently demands a brand-new angle every single post. That is what made
 * the angle the change on V32→V33, and following it here would have deferred the
 * CTA test a third time and left V33's win permanently un-replicated. ⚠️ The
 * window rule is not wrong — it is unsatisfiable at this cadence. Fixing it
 * properly (splitting the angle window from the hook window) is a separate
 * change and was deliberately NOT bundled into this cycle.
 *
 * 📐 ONE DELIBERATE CHANGE: THE CTA. `ctaText` goes from V33's "Comment your
 * birth number" to "Send this to a 7", and the caption drops the comment→DM ask
 * entirely rather than keeping it as a second line (owner, 2026-08-12). The
 * comment ask has returned 0 comments at n≈45 across every post and platform;
 * shares are the only mechanism ever measured to move this account's reach.
 * 🪤 `ctaGlyph: "👉"` is NOT decoration — CTAEnding's default 👇 points at the
 * comment box, and a share ask over a 👇 tells the viewer one thing and points
 * them at another on the exact card being measured.
 *
 * ⚠️ LAYOUT MOVED centered → split, AND IT IS FORCED, NOT CHOSEN. `pickVariation`
 * hard-skips any candidate whose layout equals the previous video's, and holding
 * V33's production exactly would also have reproduced its whole fingerprint
 * `essay|140|centered|ink-violet` two days apart. `essay|140|split|ink-violet` is
 * unused in the 14-day window. Layout was picked as the axis because it is the
 * only one that does not damage the replication: structure had to hold (the tail
 * IS the result being replicated), palette is reserved as the next cycle's test,
 * and tempo would move the payload off frame 53.
 * 🪤 STRUCTURE, BED AND TEMPO ARE HELD, SO V34 IS THE SAME 23.198s AS V33 — the
 * one duplicate-detection signal not broken here. Accepted knowingly: the
 * historical failure was 28 renders at an identical 17.450667s, not two, and
 * breaking it means moving structure, which is the thing being replicated.
 *
 * 🔴 EVERY CLAIM DERIVED FROM `moolank-cards.json` #7, NONE AUTHORED:
 * "Reads people deeply" is `relationships` verbatim; "Sees everything coming" is
 * `surpriseFact` ("A 7 sees everything coming, and trusts almost none of it");
 * "Finds grace through difficulty" is `strengths[3]` verbatim; the cold/caution
 * correction is `relationships` ("trust comes slowly") plus `shadow[0]`
 * ("Questions even the good things"), quoted as the BELIEF and then corrected,
 * which is this angle's whole shape. 7 = Ketu, born 7th/16th/25th, same card.
 *
 * ⚠️ NO PAIR LIST AND THEREFORE NO EASE LINE, exactly as V33. `friendship.ts`
 * gives 7 the friends [2,3,6] and makes 7 the ONE number neutral to itself — but
 * naming any of that on screen would be a pair claim, would put "not listed
 * doesn't mean no" back in scope, and would hand a 7 a verdict about being alone.
 * ⛔ Do not add the matches to the video. The caption does not carry them either.
 */
export const BELIEF_CORRECTION_SEVEN: ViralVideoProps = {
  ...BELIEF_CORRECTION_TWO,
  hookText: "IF YOU'RE A NUMBER 7",
  hookAccent: "NOT COLD",
  hookSub: "Trust just takes longer",
  number: 7,
  numberLabel: "KETU · 7, 16, 25",
  /**
   * FIVE traits, matching `essay`'s five value scenes at 64/71/70/64/65 — the
   * structure is inherited unchanged, so the trait count must be too. Four
   * would leave scene 5 empty, which is the 2.13s hole V33 shipped on its first
   * render. ⛔ Never drop to four here.
   *
   * Order is the angle's shape, same as V33: name the belief, correct it,
   * evidence it twice, land the reframe LAST.
   */
  traits: [
    // The belief first, then the correction. Leading with the correction leaves
    // the viewer arguing with a claim nobody made.
    "Called cold — it's caution",
    "Reads people deeply",
    "Sees everything coming",
    "Finds grace through difficulty",
    // The sentence the video exists to deliver, on the final scene before the
    // montage. "Distance" is the belief being retired; "depth" is `personality`.
    "Depth, not distance",
  ],
  ctaText: "Send this to a 7",
  // 🪤 Overrides CTAEnding's 👇. See the note above — this is load-bearing.
  ctaGlyph: "👉",
  layout: "split",
};

/**
 * Moolank 1 — "not arrogant". `belief-correction`, and THE ONE THAT SHIPS AS V34.
 *
 * ⭐ WHY 1 AND NOT 7: the owner asked for the series to run IN NUMBER ORDER
 * (2026-08-12). V33 took 2, so the next belief correction is 1, and 3/4/5/6/7
 * follow in sequence. `BELIEF_CORRECTION_SEVEN` above is already built, gated and
 * frame-scanned — it is DEFERRED, not abandoned, and ships when the run reaches 7.
 * ⛔ Do not delete it to tidy up; re-deriving a passing render costs more than the
 * dead registry entry does.
 *
 * ⭐⭐⭐ EVERYTHING ELSE IS V33 HELD STILL. This is the replication: V33 measured
 * 1,268 views / 1,140 viewers, the best Instagram post of the post-07-24 era, but
 * moved BOTH angle and structure against V32 — so it measured the package
 * `belief-correction + essay` at n=1. Angle, structure, bed, tempo, palette and
 * payload frame all hold here so a second win means something.
 *
 * 📐 ONE DELIBERATE CHANGE: THE CTA. "Comment your birth number" → "Send this to
 * a 1", and the caption drops the comment→DM ask entirely rather than demoting it
 * (owner, 2026-08-12). The comment ask has returned 0 comments at n≈45.
 * 🪤 `ctaGlyph: "👉"` is load-bearing — CTAEnding's default 👇 points at the
 * comment box. See `BELIEF_CORRECTION_SEVEN` for the full reasoning.
 *
 * 🪤 CLOSEST SHIPPED TWIN IS V04 "You Hate Being Told What To Do" (2026-07-17,
 * hook `id-1-authority`, category `identity`). Checked and cleared, but not
 * ignored: V04 is a trait statement about resisting authority; this is a belief
 * ABOUT the number, corrected. Different idea, different angle, ~4 weeks apart.
 * ⚠️ If a third Moolank 1 video is ever proposed, re-read BOTH before writing.
 *
 * 🔴 EVERY CLAIM DERIVED FROM `moolank-cards.json` #1, NONE AUTHORED:
 * the arrogance/confidence correction is `shadow[0]` ("Pride can harden into ego")
 * and the card's OWN `problemHook.ask` ("Why does your confidence keep getting read
 * as ego?"), quoted as the BELIEF then corrected — this angle's whole shape.
 * "Leadership and initiative" is `strengths[0]` verbatim; "Originality and
 * determination" is `strengths[2]` + `[3]`; "Never learned to ask for help" is
 * `surpriseFact` ("The Sun never shares the sky. A 1 gets its confidence from that
 * — and its inability to ask for help"), which is also the hook sub; "Drive, not
 * ego" is `innerWorld` ("to use will in service of others, not ego"). 1 = Sun,
 * born 1st/10th/19th/28th, same card.
 *
 * ⚠️ NO PAIR LIST AND THEREFORE NO EASE LINE, exactly as V33. `friendship.ts`
 * gives 1 the mutual pairs 1&2 and 1&4 — but naming them would be a pair claim and
 * would put "not listed doesn't mean no" back in scope. ⛔ Keep them out.
 * 🪤 The card's `luckyNumbers` for 1 are [1,2,4,7], which is NOT the mutual-friend
 * list — 1 lists 7 but 7's friends are [2,3,6]. Never publish `luckyNumbers` as
 * matches; `derive-compatibility-pairs.mjs` is the only source for a pair claim.
 */
export const BELIEF_CORRECTION_ONE: ViralVideoProps = {
  ...BELIEF_CORRECTION_SEVEN,
  hookText: "IF YOU'RE A NUMBER 1",
  hookAccent: "NOT ARROGANT",
  hookSub: "The Sun never shares the sky",
  number: 1,
  numberLabel: "SUN · 1, 10, 19, 28",
  /**
   * FIVE traits for `essay`'s five value scenes at 64/71/70/64/65. ⛔ Never drop
   * to four — that empties scene 5, which is the 2.13s hole V33 first shipped.
   * Order is the angle's shape: name the belief, correct it, evidence it twice,
   * land the reframe LAST.
   */
  traits: [
    // The belief first, then the correction. Both words are the card's own.
    "Called arrogant — it's confidence",
    "Leadership and initiative",
    // The line that stops this being a brag. `surpriseFact` pairs the Sun's
    // self-sufficiency with the cost of it, and printing only the flattering
    // half would be the Barnum read the angle exists to avoid.
    "Never learned to ask for help",
    "Originality and determination",
    // The sentence the video exists to deliver, on the last scene before the
    // montage. `innerWorld`, compressed.
    "Drive, not ego",
  ],
  ctaText: "Send this to a 1",
};

/* ===========================================================================
 * ANGLE: `one-way-match` — NEW 2026-08-13. The first angle since
 * `belief-correction`, and written because the replication of that one FAILED.
 *
 * 🔴🔴 WHAT V34 MEASURED, AND WHY THIS EXISTS. V33 (Moolank 2, "not weak") took
 * 1,268 views / 1,140 viewers. V34 held the whole package — same angle, same
 * `essay`, same tempo, same bed, same 23.198s — on Moolank 1 and took **189
 * views / 159 viewers**, avg watch 3.8s against V33's 6.9s, skip 84.0%
 * ("Higher") against 67.2% ("Lower"), 0 follows against 2. The package did NOT
 * replicate at n=2.
 * ⭐⭐⭐ THE DIAGNOSTIC IS IN THE CURVE, NOT THE TOTAL. Both videos hold ~48% at
 * 1s — identical. V33 still had ~20% at 15s; V34 was at ~5% by 3s and flat
 * after. The hook was reproduced exactly and the TAIL was not, so what failed
 * is the body, not the first second. The most economical reading: "2 is weak"
 * is a belief a 2 has actually been wounded by, and "1 is arrogant" is one a 1
 * half-enjoys. `belief-correction` needs a belief that stings; it does not
 * generalise to every number, which is precisely what running it in number
 * order forces it to do.
 *
 * ⚠️ V34 ALSO MOVED TWO THINGS, NOT ONE. The ledger records the CTA
 * (comment -> share) as "the one change", but `layout` went centered -> split
 * in the same cycle. So the tail collapse cannot be cleanly assigned to topic
 * over layout from V34 alone. Recorded rather than resolved.
 *
 * 📐 WHAT THIS ANGLE IS: your friend list and their friend list are not the
 * same list. Derived entirely from `friendship.ts` — a pair counts as mutual
 * only when BOTH rows name the other, which is the exact test
 * `scripts/derive-compatibility-pairs.mjs` applies and the exact distinction
 * `best-match` DISCARDS ("one-way entries are excluded on purpose"). This angle
 * publishes the thing best-match deliberately hid, so it is new content off a
 * table already on screen twice.
 *
 * 🔴 EVERY NUMBER CLAIM BELOW IS DERIVED, NONE AUTHORED. Read out of
 * lib/numerology/friendship.ts on 2026-08-13:
 *     n | friend      | mutual    | one-way
 *     3 | [3,6,9]     | [3,6,9]   | []
 *     6 | [3,6,9]     | [3,6,9]   | []
 *     7 | [2,3,6]     | [2]       | [3,6]
 *     8 | [3,4,6,8]   | [4,8]     | [3,6]
 *     9 | [3,6,9]     | [3,6,9]   | []
 * 3, 6 and 9 are the only numbers whose every match is mutual, and they list
 * only each other — a closed triangle. Six of the nine have at least one
 * one-way match, which is what makes "most numbers" true rather than rhetorical.
 *
 * 🪤 "Not listed doesn't mean no" IS NOT OPTIONAL AND IS NOT PADDING. Every
 * pair-claim video in this repo carries it on screen (V31, V32) because naming
 * a match list tells everyone else they are missing from it. 26 characters,
 * measured to be exactly one line at trait size — do not rewrite it shorter or
 * the word "no" orphans onto a second line, on the one bullet that must not be
 * misread. `snap` has only three trait slots and cannot hold it, so V37 carries
 * it in the caption instead and makes no exclusionary claim on screen.
 *
 * ⛔ THE ASYMMETRY MUST STAY DIRECTIONAL. Slice 2b's lesson applies verbatim:
 * `relation(a,b)` is a ROOT-NUMBER table read as "b as seen from a's row", so
 * "3 and 6 don't list 8 back" is sayable and "8 and 3 clash" is not. Never
 * collapse a one-way entry into a symmetric verdict.
 * ========================================================================= */

/**
 * V35 — Moolank 9. `essay`, and the strongest of the three: 9 is inside the
 * closed 3-6-9 triangle, so its answer is a clean positive and the sting sits
 * entirely in the setup ("most numbers have a one-way match") rather than on
 * the viewer.
 *
 * 🔴 FIVE TRAITS, NOT FOUR. `essay`'s value act plans FIVE pairs whatever
 * `traits.length` is — verified against `planViralVideo` on 2026-08-13:
 * essay/4-traits and essay/5-traits both return pairs=[64,64,64,64,65]. Four
 * traits therefore leaves scene 5 empty, which is the 2.13s of blank screen
 * V33 shipped on its first render. ⛔ Never drop to four here.
 */
export const ONE_WAY_MATCH_NINE: ViralVideoProps = {
  ...SELF_FRIENDLY_THREE,
  hookText: "IF YOU'RE A NUMBER 9",
  hookAccent: "THEY WANT YOU BACK",
  hookSub: "Every single one of them",
  number: 9,
  numberLabel: "MARS · 9, 18, 27",
  /**
   * 🪤 EVERY LINE IS <= 21 CHARACTERS. The repo's existing "26 characters is
   * exactly one line" note is TRUE ONLY FOR THE LAYOUT AND TRAIT SIZE IT WAS
   * WRITTEN AGAINST — re-measured by rendering and looking on 2026-08-13, a
   * 25-char line wraps on `centered` here. 21 is the verified ceiling. The first render of this video used `grid`, whose column is
   * narrower still, and "9's list: 3, 6 and 9" wrapped with the trailing 9
   * ALONE on line two — on a video whose entire claim is what is on 9's list.
   * Same orphan failure the repo already documents for "Not listed doesn't
   * mean no", one character worse: here the orphan is the number itself.
   * ⛔ Do not lengthen these to read more naturally. Watch a render if you do.
   */
  traits: [
    "9 wants 3, 6 and 9",
    "They want 9 back",
    "Others still work",
    // 6 of the 9 numbers carry at least one one-way entry, so "most" is
    // counted, not rhetorical.
    "Most numbers chase",
    "A 9 never has to",
  ],
  // Share, not comment. The comment ask has returned 0 comments at n~45 across
  // every post and platform; shares are the only mechanism ever measured to
  // move this account's reach (20 shares -> 271, 126 -> 499).
  // 🪤 ctaGlyph 👉 is load-bearing: CTAEnding's default 👇 points at the comment
  // box, and a share ask over a 👇 points the viewer somewhere it did not ask.
  ctaText: "Send this to a 9",
  ctaGlyph: "👉",
  structure: { hook: 1.2, build: 0.8, value: 18.8, cta: 2.6 },
  palette: "ember",
  /**
   * 🔴🔴 `centered` ON ALL THREE, AND THE VARIATION RULE IS KNOWINGLY NOT
   * SATISFIED ON THIS ONE AXIS. THE 26-CHARACTER ONE-LINE LIMIT IS
   * LAYOUT-SPECIFIC, which the repo's existing notes do not say — they were all
   * written against `centered`. Measured by rendering and LOOKING on
   * 2026-08-13: `grid` wrapped a 20-char line, `fullbleed` wrapped 25, `split`
   * wrapped 26. Only `centered` holds ~26. Every other layout caps near 20,
   * which no line carrying two number lists can meet.
   * The three still differ on structure, tempo and palette, so the
   * `structure|tempo|layout|palette` fingerprint is unique across all three AND
   * against V32-V34. Trading a REAL orphaned-word defect for a theoretical
   * duplicate-detection risk on one of four axes is the wrong trade, and
   * `centered` is the layout the account's best-ever post (V33) shipped on.
   */
  layout: "centered",
  // 150 BPM. `tempo` is not a prop — the bed IS the tempo, and holding
  // cipherV15 (140) across V32-V34 is a fingerprint axis left unmoved for
  // three videos. helixV19 is tracked and usable at 149.95.
  music: MUSIC.helixV19,
};

/**
 * V36 — Moolank 8. `standard`, and the angle's sharpest case: 8 lists four
 * numbers and only two list it back.
 *
 * 🔴 FIVE TRAITS BECAUSE FOUR BREACHES THE CEILING. `standard` with FOUR traits
 * plans pairs=[73,68,64,65] — 73 frames against the 72-frame pair ceiling
 * (SCENE_CHANGE * 2). Five traits plan [64,52,51,51,52], all clear. Measured
 * with `planViralVideo`, not reasoned about. ⛔ Do not trim to four.
 */
export const ONE_WAY_MATCH_EIGHT: ViralVideoProps = {
  ...ONE_WAY_MATCH_NINE,
  hookText: "IF YOU'RE A NUMBER 8",
  hookAccent: "YOU WANT THEM MORE",
  hookSub: "Two of them, anyway",
  number: 8,
  numberLabel: "SATURN · 8, 17, 26",
  traits: [
    "8 wants 3 and 6",
    // Directional, per Slice 2b. NOT "8 and 3 clash" — the table does not say
    // that, and 8's own row calls 3 a friend.
    "They don't want 8",
    "Others still work",
    "4 and 8 want 8 back",
    "Two who do is enough",
  ],
  ctaText: "Send this to an 8",
  structure: { hook: 1.2, build: 0.8, value: 15.2, cta: 2.4 },
  palette: "sage-gold",
  /**
   * 🔴🔴 `centered` ON ALL THREE, AND THE VARIATION RULE IS KNOWINGLY NOT
   * SATISFIED ON THIS ONE AXIS. THE 26-CHARACTER ONE-LINE LIMIT IS
   * LAYOUT-SPECIFIC, which the repo's existing notes do not say — they were all
   * written against `centered`. Measured by rendering and LOOKING on
   * 2026-08-13: `grid` wrapped a 20-char line, `fullbleed` wrapped 25, `split`
   * wrapped 26. Only `centered` holds ~26. Every other layout caps near 20,
   * which no line carrying two number lists can meet.
   * The three still differ on structure, tempo and palette, so the
   * `structure|tempo|layout|palette` fingerprint is unique across all three AND
   * against V32-V34. Trading a REAL orphaned-word defect for a theoretical
   * duplicate-detection risk on one of four axes is the wrong trade, and
   * `centered` is the layout the account's best-ever post (V33) shipped on.
   */
  layout: "centered",
  // 128 BPM, tracked and usable at 128.15.
  music: MUSIC.pulseV13,
};

/**
 * V37 — Moolank 7. `snap`, and DELIBERATELY THE GENTLE CUT.
 *
 * 🔴🔴 7 IS THE ONE NUMBER THIS ANGLE CAN HURT. Its mutual set is [2] alone and
 * it is the only number not friendly to itself. The full one-way reading —
 * "you list three, one lists you back" — hands a 7 a verdict about being alone,
 * which `BELIEF_CORRECTION_SEVEN` already refused to do on the same table and
 * for the same reason. So this cut names what IS mutual and what 7 is to
 * itself, and never counts what is missing.
 * ⛔ Do not "complete the set" by adding the one-way line here. It is omitted on
 * purpose, and the omission is the point.
 *
 * 🪤 `snap` has THREE trait slots (pairs=[52,64,64]), which cannot hold "Not
 * listed doesn't mean no". That is survivable ONLY because this cut makes no
 * exclusionary claim on screen — no "only", no count of who is missing. The
 * line still ships in the caption.
 *
 * ⭐ Shortest of the three on purpose. Every tail this account has ever measured
 * collapses; V34 was flat at ~5% from 3s to 23s, which is 20 seconds of video
 * nobody watched. 14.2s is the first real test of whether a shorter cut holds a
 * larger FRACTION, and it is cheap to run as the third of a set.
 */
export const ONE_WAY_MATCH_SEVEN: ViralVideoProps = {
  ...ONE_WAY_MATCH_NINE,
  hookText: "IF YOU'RE A NUMBER 7",
  hookAccent: "ONE WANTS YOU BACK",
  hookSub: "And one is enough",
  number: 7,
  numberLabel: "KETU · 7, 16, 25",
  traits: [
    "7 wants 2, 3 and 6",
    "2 wants 7 back",
    // The gentle landing. friendship.ts puts 7 in its OWN neutral row, never
    // its enemy row, and 2 is a genuine two-way match — so "one is enough" is
    // the true reading AND the one that does not tell a 7 they are alone.
    "One is enough",
  ],
  ctaText: "Send this to a 7",
  structure: { hook: 1.2, build: 0.8, value: 10.2, cta: 2.0 },
  palette: "ink-violet",
  /**
   * 🔴🔴 `centered` ON ALL THREE, AND THE VARIATION RULE IS KNOWINGLY NOT
   * SATISFIED ON THIS ONE AXIS. THE 26-CHARACTER ONE-LINE LIMIT IS
   * LAYOUT-SPECIFIC, which the repo's existing notes do not say — they were all
   * written against `centered`. Measured by rendering and LOOKING on
   * 2026-08-13: `grid` wrapped a 20-char line, `fullbleed` wrapped 25, `split`
   * wrapped 26. Only `centered` holds ~26. Every other layout caps near 20,
   * which no line carrying two number lists can meet.
   * The three still differ on structure, tempo and palette, so the
   * `structure|tempo|layout|palette` fingerprint is unique across all three AND
   * against V32-V34. Trading a REAL orphaned-word defect for a theoretical
   * duplicate-detection risk on one of four axes is the wrong trade, and
   * `centered` is the layout the account's best-ever post (V33) shipped on.
   */
  layout: "centered",
  // 165 BPM, tracked and usable at 164.95 — the fastest bed in the library,
  // paired with the shortest structure.
  music: MUSIC.kineticV18,
};

/**
 * V38 — Moolank 6, and the angle turned around: this is the FIRST cut on the
 * RECEIVING end of a one-way match.
 *
 * ⭐⭐⭐ WHY 6 IS NOT ANOTHER "YOUR MATCHES ARE MUTUAL" VIDEO. 6's own row is
 * `friend: [3, 6, 9]` and every one of those lists 6 back, so the mutual
 * reading of 6 is the closed 3-6-9 triangle — WHICH HAS ALREADY SHIPPED as the
 * one-off `T369` ("Numerology 3 6 9 — The Part Nobody Explains", 2026-08-05).
 * The standing rule is that a published content IDEA is never reused, so the
 * mutual side of 6 is closed. What is NOT published is the other direction.
 *
 * 🔴 DERIVED FROM `friendship.ts`, COUNTED NOT GUESSED (2026-08-16). Scanning
 * every ordered pair for "a lists b as friend, b does not list a":
 *   incoming one-way  3 ← [5,7,8]   6 ← [5,7,8]   7 ← [1,4]   9 ← [2,5]   2 ← [4]
 * **5, 7 and 8 all name 6 a friend, and 6 names none of them back** — all
 * three sit in 6's `neutral` row. 6 ties 3 for the most one-sided admirers in
 * the whole table, and 6's `enemy` list is EMPTY (only 5 and 6 are).
 *
 * ⭐⭐⭐ THE CLAIM HAS TO STING, AND THIS ONE DOES — measured 2026-08-16 across
 * five videos. Sorting V33/V34/V35/V36/V37 by whether the claim says something
 * UNFLATTERING ABOUT THE VIEWER splits the winners from the losers perfectly,
 * and it does so across two different angles, so the angle was never the
 * variable. 6 is Venus, the giver — telling a 6 that three numbers want them
 * and they want none of them back accuses the giver of withholding, which is
 * the same shape as "2 is weak" (V33) and "you want them more" (V36).
 * ⛔ Do NOT re-cut this as "three numbers want you" — that is flattery, it is
 * the V35 mistake ("THEY WANT YOU BACK", 253 views), and the accent is the only
 * line most viewers read. The sting must be the thing 6 does not give back.
 *
 * 🪤 THE LANDING IS DERIVED, NOT SOFTENING FOR ITS OWN SAKE. 6's enemy list is
 * literally empty, so "6 has no enemies" is a fact, not a consolation — and it
 * resolves the sting honestly: a 6 is not rejecting those three, the table puts
 * them at neutral. V36 landed warm after a stinging claim and won; V37 landed
 * warm after a CONSOLING claim and lost. The landing is safe; the claim is what
 * must wound.
 *
 * 🔴🔴 THE FINGERPRINT IS WHY THIS IS NOT A BYTE-FOR-BYTE V36 CLONE. The
 * disciplined move after a win is to hold the package and change one thing —
 * but `structure|tempo|layout|palette` must not repeat inside
 * VARIATION_WINDOW_DAYS (14), and duplicate fingerprints are what got the first
 * TikTok account suppressed to literal zero views. V36 is
 * `standard|128|centered|sage-gold` and posted 2026-08-14, so that exact
 * package is unavailable until 2026-08-28.
 * ⇒ ONE axis moves, and it is deliberately the one a scrolling human cannot
 * see: **tempo, 128 → 140**. Structure, layout and palette — everything visible
 * — are held identical to the best post the account has ever had.
 * ⭐ `meridianV16` (140.03) is used rather than `cipherV15` (139.95) because
 * cipher already ran on V32-V34 and meridian has never shipped; that refreshes
 * the bed without spending ElevenLabs credits on a tempo the pool already
 * covers, and without adding a second uncontrolled variable to the test.
 *
 * 🔴 FIVE TRAITS, for V36's reason exactly: `standard` with FOUR traits plans a
 * 73-frame pair against the 72-frame ceiling (SCENE_CHANGE * 2). Verified with
 * `planViralVideo`, not reasoned about. ⛔ Do not trim to four.
 *
 * 🪤 EVERY LINE IS <= 21 CHARACTERS, the verified `centered` ceiling. The
 * longest here is "A 6 wants none back" at 19.
 */
export const ONE_WAY_MATCH_SIX: ViralVideoProps = {
  ...ONE_WAY_MATCH_NINE,
  hookText: "IF YOU'RE A NUMBER 6",
  // The sting. 19 chars. ⛔ Not "THREE WANT YOU BACK" — see the warning above.
  hookAccent: "YOU DON'T WANT THEM",
  hookSub: "Three of them want you",
  number: 6,
  numberLabel: "VENUS · 6, 15, 24",
  traits: [
    // Counted from friendship.ts: 5, 7 and 8 each carry 6 in `friend`.
    "5, 7 and 8 want 6",
    // Directional, per Slice 2b — 6's row puts all three at NEUTRAL, so this
    // says "not returned", never "clash".
    "A 6 wants none back",
    "6 wants 3 and 9",
    "They want 6 back",
    // 6's `enemy` array is empty. One of only two numbers (with 5) that is.
    "6 has no enemies",
  ],
  ctaText: "Send this to a 6",
  structure: { hook: 1.2, build: 0.8, value: 15.2, cta: 2.4 },
  palette: "sage-gold",
  // `centered`, as V33-V37. The one-line ceiling is layout-specific and only
  // `centered` holds past ~21 chars; see the note on ONE_WAY_MATCH_NINE.
  layout: "centered",
  // 140 BPM, tracked and usable at 140.03. The single moved axis.
  music: MUSIC.meridianV16,
};

/**
 * V39 — Moolank 5, and the hardest fact in the whole table.
 *
 * 🔴 DERIVED FROM `friendship.ts`, COUNTED NOT GUESSED (2026-08-17). Scanning
 * every ordered pair for "a names b a friend":
 *     n | friend      | mutual  | one-way out | NAMED BY
 *     5 | [3,5,6,9]   | [5]     | [3,6,9]     | [5]
 * **5 is the only number in the table that no other number names as a friend.**
 * Its whole outgoing list is one-way, its mutual set is itself alone, and it
 * appears in nobody's `enemy` row either — so every other number holds a 5 at
 * exactly `neutral`. Nobody's friend, nobody's enemy. Verified against 1, 2, 4,
 * 7 and 8, each of which is named by at least two rows; 5 is unique.
 *
 * ⭐⭐⭐ THE STING RULE IS NARROWER THAN V38 SAID, AND V38 IS THE MEASUREMENT
 * THAT NARROWED IT. Measured 2026-08-17 off the owner's IG screenshots: V38
 * took 194 views / 164 viewers, avg watch 3.9s (*Lower*), skip 80.2%
 * (*Higher*), 0 follows, on a package held VISUALLY IDENTICAL to the best post
 * the account has ever had. Body survival hold(5s)/hold(1s) = 17.1/54.9 =
 * **31.1%**, which is inside the loser cluster (<32%) the V38 build predicted
 * would die — the predictor held at n=6, the package did not.
 * Re-sorting all six by WHAT THE CLAIM DOES TO THE VIEWER splits them perfectly
 * where "is it unflattering?" no longer does:
 *   · names a wound the viewer ALREADY FEELS → held the body → WON
 *       V33 "2 IS NOT WEAK" (1,268) · V36 "YOU WANT THEM MORE" (1,896)
 *   · hands the viewer an ACCUSATION, or flatters, or consoles → died
 *       V34 "1 IS NOT ARROGANT" (189) · V35 "THEY WANT YOU BACK" (253)
 *       V37 "ONE WANTS YOU BACK" (180) · V38 "YOU DON'T WANT THEM" (194)
 * V38 wounded in the wrong direction: it accused a 6 of withholding. An
 * accusation about your character makes a viewer defensive and they scroll; a
 * pain they are already carrying makes them stay. ⭐ Screen every claim on
 * "does this name something they already feel?" — not merely "does it sting?"
 *
 * ⭐⭐⭐ WHICH IS WHY 5 IS THE STRONGEST CUT THIS TABLE CAN PRODUCE. Mercury,
 * the communicator — the number that gets along with everyone. Telling a 5
 * "you are everybody's friend and nobody's match" is not a verdict invented
 * about them; it is the exact thing a 5 already suspects. It is the V33/V36
 * shape at its purest, and the fact underneath it is unique in the ruleset.
 *
 * 🪤 THE LANDING IS DERIVED AND IT IS LOAD-BEARING. `angle`'s standing rule is
 * never to leave a verdict on the reader, and `BELIEF_CORRECTION_SEVEN` and
 * V37 both refused to tell a 7 they were alone. This cut goes further than
 * either, so the resolution has to be real rather than kind: 5's `enemy` array
 * is literally EMPTY (one of only two, with 6), and 5 IS mutual with 5. So the
 * turn is a counted fact, not a consolation — and V36 proves a warm landing
 * after a wounding claim is what wins, while V37 proves a warm landing after a
 * CONSOLING claim is what loses. ⛔ Do not re-cut this as "5 gets on with
 * everyone" — that is flattery and it is the V35 failure verbatim.
 *
 * 🔴🔴 FINGERPRINT: ONE INVISIBLE AXIS OFF A PROVEN WINNER — the same method
 * V38 used, pointed at the other winner. V36's package
 * (`standard|128|centered|sage-gold`) is locked until 08-28 and V33's
 * (`essay|140|centered|ink-violet`) until 08-26, so neither can be reused
 * inside VARIATION_WINDOW_DAYS. This takes V33's — the account's #2 post — and
 * moves TEMPO ONLY, 140 → 150: `essay|150|centered|ink-violet`, unique against
 * every entry in the ledger.
 * ⭐ It also breaks a look that has now shipped twice in four days. V36 (08-14)
 * and V38 (08-17) are both `sage-gold|standard|centered` at 19.6s, and V38's
 * hold at 1s fell to 54.9% against V36's 67.7% on near-identical frames — which
 * is either the claim or viewers recognising a card they scrolled past two days
 * earlier, and those two are not separable from V38 alone. Going dark, long and
 * 23.4s removes the second explanation instead of running it a third time.
 * ⭐ `quartzV20` (149.91, tracked, 5.9ms spread) has NEVER shipped, so the bed
 * is fresh without spending ElevenLabs credits on a tempo the pool covers.
 *
 * 🔴 FIVE TRAITS, as `essay` requires — its value act plans five pairs whatever
 * `traits.length` is, and four would leave scene 5 blank (the 2.13s hole V33
 * shipped on its first render). Verified with `planViralVideo` on quartzV20:
 * pairs=[60,72,72,60,72], payload at frame 60 = 2.0s, every pair at or under
 * the 72-frame ceiling. ⛔ Do not trim to four.
 *
 * 🪤 EVERY LINE IS <= 21 CHARACTERS, the verified `centered` trait ceiling; the
 * longest here is "5 wants 3, 6 and 9" and "Only a 5 wants a 5" at 18. The
 * accent is 19, matching V38's, because the accent renders far larger than a
 * trait and 18-19 is the only length this angle has actually shipped.
 */
export const ONE_WAY_MATCH_FIVE: ViralVideoProps = {
  ...ONE_WAY_MATCH_NINE,
  hookText: "IF YOU'RE A NUMBER 5",
  // The wound, not an accusation. 19 chars. ⛔ Not "YOU GET ON WITH EVERYONE".
  hookAccent: "NOBODY WANTS 5 BACK",
  hookSub: "You want three of them",
  number: 5,
  numberLabel: "MERCURY · 5, 14, 23",
  traits: [
    // 5's friend row is [3,5,6,9]; the three others are 3, 6 and 9.
    "5 wants 3, 6 and 9",
    // Directional, per Slice 2b: 3, 6 and 9 each list [3,6,9], so 5 is absent
    // from all three. Says "not returned", never "clash".
    "None want 5 back",
    // The uniqueness, and the only genuinely new fact this angle has left:
    // no row in the table names 5 except 5's own.
    "No one else does",
    // mutual([5]) = [5]. The turn.
    "Only a 5 wants a 5",
    // 5's `enemy` array is empty, and 5 appears in no other number's enemy row
    // either. Counted, not softened.
    "5 has no enemies",
  ],
  ctaText: "Send this to a 5",
  structure: { hook: 1.2, build: 0.8, value: 18.8, cta: 2.6 },
  palette: "ink-violet",
  // `centered`, as V33-V38. The one-line ceiling is layout-specific and only
  // `centered` holds past ~21 chars; see the note on ONE_WAY_MATCH_NINE.
  layout: "centered",
  // 150 BPM, tracked and usable at 149.91. The single moved axis.
  music: MUSIC.quartzV20,
};

/**
 * V40 — Moolank 4, and the first video in this series written to be FELT
 * rather than decoded.
 *
 * 🔴 DERIVED FROM `friendship.ts`, COUNTED NOT GUESSED (2026-08-18).
 *     4: friend [1,2,4,7,8] · neutral [5,6] · enemy [3,9]
 * Scanning every ordered pair for "a names b a friend":
 *   · 4 names FOUR others (1, 2, 7, 8). Every other number names at most
 *     three — 1→[2,4,7], 2→[1,7,9], 3→[6,9], 5→[3,6,9], 6→[3,9], 7→[2,3,6],
 *     8→[3,4,6], 9→[3,6]. **4's is the longest outgoing row in the table.**
 *   · Named 4 back: **1** (`[1,2,4,7]`) and **8** (`[3,4,6,8]`). Two of four.
 *   · One-way out: **2** and **7**. Neither holds 4 as an enemy — 2's neutral
 *     row is [3,4,5,6] and 7's is [1,4,5,7,8] — so both hold a 4 at exactly
 *     `neutral`. Not rejected. Not chosen.
 *
 * 🪤 RECYCLE CHECK — 4 IS THE ONE NUMBER THIS SERIES CANNOT WRITE FREELY.
 * `BEST_MATCH_FOUR` / `BEST_MATCH_FOUR_EN` (V30/V31, published 08-10) already
 * shipped 4's MUTUAL set as their whole payload: "your best matches are 1 and
 * 8". That post is the account's second-biggest TikTok result. So this video is
 * built strictly on the COMPLEMENT — the two that do not count 4 back — and
 * 1 and 8 appear only in the closing turn. ⛔ Never re-cut this as "your best
 * matches are 1 and 8"; that is V30 verbatim and breaks the standing
 * no-recycled-ideas rule.
 *
 * ⭐⭐⭐ WHY THE FORMAT MOVES, AND WHY IT IS THE OWNER'S CALL, NOT A DRIFT.
 * Owner instruction 2026-08-18: "make the video so it's humanized, emotional
 * and easily understandable. If that means you have to slow the video down a
 * bit to add more context, feel free." That authorises the axis every previous
 * video in this series held fixed. The measurement backs it: V35-V39 are five
 * straight Instagram losers (253 / 1,896* / 180 / 194 / 183 — *V36 excepted),
 * and V39's body survival was **18.8%**, the worst yet, with the collapse
 * landing between 1.5s (41.8% held) and 3.0s (16.9%). The lines it collapsed
 * on read "5 wants 3, 6 and 9" and "None want 5 back" — table notation, not
 * language. **Nothing in the ledger has ever tested whether a human sentence
 * holds better than a lookup row**, because every cut so far has been terse.
 *
 * 🔴 SO THIS IS THE SLOWEST LEGAL CUT THE SYSTEM CAN PRODUCE. `long` (27.8s)
 * has NEVER shipped; its 690-frame value act gives `makeValueScenes`
 * montage 110 / number 174 / pairBudget 406, and `byTime = ceil(406/72) = 6`
 * ⇒ SIX scenes at ~68 frames (2.27s) each, against V39's five. ⛔ Six traits
 * is therefore a FLOOR, not a preference: five would leave scene 6 empty and
 * ship the blank-screen hole `checkTraitCoverage` exists to block.
 *
 * 🔴🔴 FINGERPRINT `long|128|stack|ember` — TWO axes have never shipped at all.
 * Structure `long` is unused across the whole ledger, and `stack` is the only
 * layout in `LAYOUTS` never rendered (7 videos on `centered`, 1 on `split`).
 * 128 last appeared 08-14 and `ember` 08-13, both outside the pairing. Verified
 * against `findDuplicateFingerprints` and the 14-day window, not read off a
 * list.
 *
 * ⭐⭐⭐ THE LINES ARE ALLOWED TO WRAP HERE, AND THAT IS THE POINT. Owner,
 * 2026-08-18, on the first cut: *"V40 is not easy on the eyes — people will not
 * understand 'You count four of them', 'No number counts more'. It's more
 * convenient to read 'You are attracted towards four of them'."* Correct, and it
 * exposes a rule this repo had been enforcing without ever deciding it: the
 * one-line character ceiling made every trait a telegram. `TraitBullet` sets no
 * `nowrap`, so a trait has ALWAYS been free to run two lines — the measured
 * ceilings (`centered` ~26, `split` 26, `fullbleed` 25, `grid` 20, and `stack`
 * 24, measured here by rendering) describe where ONE line ends, not where a
 * trait must.
 * 🪤 The real defect the ceilings were guarding against is an ORPHAN — one word
 * stranded on line two, which is what wrecked an early `grid` cut. A balanced
 * two-line break is not that. The longest line here is 44 characters and every
 * wrap was rendered and looked at.
 * ⛔ STILL DO NOT SHIP A CHANGE TO THESE LINES WITHOUT RENDERING ONE AND LOOKING.
 *
 * 🪤 BED: `obsidianV14` (127.95 BPM tracked, usable map). Chosen on DURATION,
 * not taste — `blackVelvetAria` is the other fresh bed at this tempo and it is
 * **25.0s against a 27.8s cut**, which would have shipped 2.8s of silence under
 * the CTA. The 32.08s beds are the only ones `long` can ride.
 */
export const ONE_WAY_MATCH_FOUR: ViralVideoProps = {
  ...ONE_WAY_MATCH_NINE,
  hookText: "IF YOU'RE A NUMBER 4",
  // ⛔ Not "YOUR BEST MATCHES ARE 1 AND 8" — that is V30, already published.
  // 🔴 "COUNT" WAS REJECTED BY THE OWNER 2026-08-18 as unreadable ("people will
  // not understand 'You count four of them'"), so it is gone from the accent
  // and the sub as well as the traits — the cover and the film have to speak
  // the same English, and covers.test.ts pins accent === hookAccent anyway.
  // 🔴 OWNER'S WORDING, 2026-08-18, chosen over my "TWO NEVER FELT IT". 20 chars,
  // two lines on the cover — the three-line accent it replaces pushed the title
  // block up into the Metatron cube.
  // ⭐ It also flips what the cover DOES: it states the reassurance and lets the
  // sub carry the sting, and trait 5 then completes the same sentence at 17.9s
  // ("You're not disliked — just not on their list"). Hook and payoff now rhyme
  // deliberately instead of the cover spending the whole claim up front.
  hookAccent: "YOU ARE NOT DISLIKED",
  hookSub: "Two just never felt it",
  number: 4,
  numberLabel: "RAHU · 4, 13, 22, 31",
  /**
   * 🔴 SIX TRAITS, one per scene, and the order IS the emotional arc — the
   * thing the owner asked for. Recognition (1-2), the split (3-4), the name for
   * what the other half actually is (5), the turn (6). Every line is a
   * sentence a person would say out loud; none is a list of digits, which is
   * the single deliberate break from V35-V39.
   */
  traits: [
    // 4's friend row names 1, 2, 7 and 8 — four others.
    "You're drawn to four of them",
    // 4's outgoing row is the longest in the table. Counted above, not asserted.
    "No other number likes that many",
    // 1 and 8 name 4 back. Withheld by name until the last line.
    "Only two feel the same way back",
    // 2 and 7 do not, and never have — neither has ever listed 4.
    "The other two never have",
    // ⭐ THE LINE THIS VIDEO EXISTS FOR. `neutral`, said in language: 2 and 7
    // hold 4 in their neutral rows, not their enemy rows. Not rejected — not
    // chosen. ⛔ Never soften this to "they still like you"; that is flattery,
    // and it is the V35 failure verbatim.
    "You're not disliked — just not on their list",
    // The turn, and the only place the mutual set is allowed to appear.
    "1 and 8 always felt it back",
  ],
  // Share, not comment: the comment ask has returned 0 comments at n~50 on
  // every post and platform. ctaGlyph 👉 is inherited from NINE and is
  // load-bearing — CTAEnding's default 👇 points at the comment box.
  ctaText: "Send this to a 4",
  // `long`, 27.8s. Clean act seconds; `snapRun` pulls the inner cuts onto
  // obsidianV14's tracked beats at render time.
  structure: { hook: 1.2, build: 0.8, value: 23.0, cta: 2.8 },
  palette: "ember",
  layout: "stack",
  music: MUSIC.obsidianV14,
};

/**
 * Moolank 3 — "EVERYONE LIKES A 3 · EXCEPT TWO". THE ONE THAT SHIPS AS V41.
 *
 * ⭐⭐⭐ THE FIRST VIDEO IN THE SERIES WITH A DIFFERENT FIRST FRAME. V35-V40
 * all rendered the identical hook — centred block, 112/128/52, Metatron cube
 * directly above — because `ViralHook` never called `useLayout()` and the
 * `layout` prop only ever moved the BODY. V40 shipped `layout: "stack"` and
 * still rendered dead-centre. Measured cost: the 1s hold sat at 54.9 / 54.9 /
 * 56.5 / 54.9 across V37-V40 while palette, tempo and duration were varied and
 * the composition could not move. Now that the hook reads the spec, `stack`
 * puts this hook LEFT-ALIGNED IN THE LOWER THIRD at 91/104/42 — the first
 * genuinely different card the account has posted in six.
 * 🎯 SUCCESS IS THE 1s HOLD BACK ABOVE 60%, not views. The body build is held
 * close to V40's on purpose so the hook stays the one thing being measured.
 *
 * 🔴 EVERY CLAIM DERIVED FROM `friendship.ts`, NONE AUTHORED. Counted
 * 2026-08-19 over all nine rows (scratchpad/derive3.py):
 *   · named FRIEND by 3, 5, 6, 7, 8, 9 — SIX of the nine, the joint most of
 *     any number in the table.
 *   · 6 is the only other number named that widely, and 6's enemy list is
 *     EMPTY. 3's is not.
 *   · 3 is named an ENEMY by exactly two rows: 1 and 4.
 *   · 3's own enemy row is [1] — so 1 is MUTUAL and a 3 already knows.
 *     4 names 3 an enemy while 3 holds 4 at `neutral`. ⭐ THAT ASYMMETRY IS
 *     THE WHOLE VIDEO: the dislike a 3 cannot see.
 *
 * ⭐⭐ THE STING IS IN THE ACCENT, WHICH IS WHERE V40 LOST IT. V40's accent
 * ("YOU ARE NOT DISLIKED") is reassurance — the V35/V37 consolation failure —
 * and its wound was demoted to the sub-line. Here the accent is the wound:
 * "EXCEPT TWO" names something a widely-liked person already carries, and it
 * asks a question the body pays off (which two, and why one is invisible).
 * ⛔ Never soften this to "almost everyone likes you"; that is flattery and it
 * is the V35 failure verbatim.
 * 🪤 Ten characters, one line. V40's three-line accent orphaned the word "NOT"
 * on its own line, deferring the meaning to line three at the exact moment the
 * viewer decides.
 *
 * 🎨 `ink-violet`. 🪤 `mono` was tried first and rejected on a rendered frame:
 * its ACCENT is `oklch(0.48 0.14 230)` — BLUE — so the hook lost the gold the
 * whole account is built on, and the near-white ground read washed out and
 * low-contrast, which is the `first-second` skill's named prime suspect for a
 * card that "reads as not-a-video". Palette is not the lever (V38 proved that),
 * so it is deliberately held IN-FAMILY here to keep the hook GEOMETRY the one
 * thing that changed. Dark also separates it from V40's ember on the grid.
 * 🪤 BED: `vertexV17` (164.03 BPM tracked, 2.5ms spread — the tightest map in
 * the pool) and the only bed in `beat-maps.json` that has never shipped.
 * ⏱ 16.4s. Distinct from V37 14.2 / V38 19.6 / V39 23.4 / V40 27.8, and
 * deliberately clear of 17.45s, the fixed duration TikTok once withheld the
 * set for.
 */
export const LIKED_EXCEPT_TWO_THREE: ViralVideoProps = {
  hookText: "EVERYONE LIKES A 3",
  hookAccent: "EXCEPT TWO",
  hookSub: "Born 3rd, 12th, 21st or 30th",
  variant: "identity",
  number: 3,
  numberLabel: "JUPITER · 3, 12, 21, 30",
  /**
   * FIVE TRAITS, one per scene, and the order is the arc: the flattering fact
   * (1), the one number that beats it (2), the catch that turns it (3), the
   * count (4), the sting (5). Every line is a sentence a person would say out
   * loud — the register the owner asked for, carried on from V40.
   */
  traits: [
    // Rows naming 3 as a friend: 3, 5, 6, 7, 8, 9. Counted, not asserted.
    "Six of the nine call you a friend",
    // 6 is named by the same six rows — the only other number that is.
    "Only 6 is liked that widely",
    // 6's enemy array is empty; 3's is [1, 4]. This is the hinge of the video.
    "But nobody dislikes a 6",
    // The two rows that name 3 an enemy: 1 and 4.
    "Two of them dislike a 3",
    // ⭐ THE LINE THIS VIDEO EXISTS FOR. 3's own enemy row is [1], so 1 is
    // mutual and visible. 4 names 3 an enemy while 3 holds 4 at neutral — a
    // one-way dislike a 3 has no way of noticing. ⛔ Never cut this to make
    // room; without it the video is a count, not a wound.
    "1 you knew about. 4 you never did",
  ],
  // Share, not comment — the comment ask has returned 0 comments at n~50.
  ctaText: "Send this to a 3",
  // 16.4s. Payload at hook + build = 2.0s exactly, the PAYLOAD_BY_FRAME target;
  // `snapRun` pulls the inner cuts onto vertexV17's tracked beats at render.
  structure: { hook: 1.2, build: 0.8, value: 11.9, cta: 2.5 },
  palette: "ink-violet",
  layout: "stack",
  music: MUSIC.vertexV17,
};

/**
 * V42 — MOOLANK 2, and the first cut in ten posts that is NOT one-way-match.
 *
 * ⭐⭐⭐ WHY THE ANGLE CHANGED. `content/angles.json` still carries
 * `one-way-match` at `status: "hypothesis"` — it was never promoted. V35-V41
 * are all one-way-match and the run reads 263 / 1,935 / 187 / 201 / 215 / 203 /
 * 192: one win at the fourth exposure and nothing above 263 since. Meanwhile
 * `best-match` is APPROVED, on a same-account control (@numberswithrimzim
 * 51.9K-57.2K vs that account's 6.8K-25.9K), and has not shipped since V30/V31.
 *
 * ⭐⭐⭐ WHY THE HOOK LEADS WITH THE BIRTHDATE. The account's own two best posts
 * ever both open on the date, not on the number: `MOOLANK 5 · Born on the 5th,
 * 14th or 23rd?` (2,408) and `BORN ON THE 7TH, 16TH OR 25TH? YOU'RE A 7`
 * (1,418). Nine straight posts opened `IF YOU'RE A NUMBER n`, which a viewer
 * can only answer if they ALREADY KNOW their number — and 93.6% of V41's
 * viewers were non-followers. V41 then removed even that cue and took the
 * worst 1s hold in the series (45.9% by Instagram's own tooltip).
 * The market agrees: the biggest reel in the niche right now is "Are you
 * Dating/Married to a moolank no. 5 (Born on 5, 14, 23)" at 180K.
 *
 * 🪤 PACKAGE HELD AS CLOSE TO V36 AS THE DUPLICATE RULE ALLOWS. V36 is
 * `standard|128|centered|sage-gold`, posted 08-14 and locked until 08-28, so
 * tempo moves to 150 and everything else matches the best post of the era.
 * That is deliberate: V38 already proved the package alone does not win, so
 * the package is the CONTROL here and the angle + hook copy are the variable.
 * ⛔ Do not also move layout or palette — `stack` has now lost twice (V40, V41).
 *
 * EVERY LINE COUNTED FROM friendship.ts, 2026-08-20:
 *   2: { friend: [1, 2, 7, 9], neutral: [3, 4, 5, 6], enemy: [8] }
 *   - outgoing to OTHERS = 1, 7, 9 (three; self excluded on purpose so trait 2
 *     can say "only 1 and 7" without the self-match contradicting it)
 *   - 1's friends [1,2,4,7] contains 2 -> MUTUAL; 7's friends [2,3,6] contains
 *     2 -> MUTUAL; 9's friends [3,6,9] does NOT -> one-way, and 9 holds 2 at
 *     neutral ([1,2,5,8])
 *   - 4's friends [1,2,4,7,8] contains 2 while 2 holds 4 at neutral -> the
 *     one-way running TOWARDS a 2
 *   - NO row in the table names 2 in `enemy`. Only 2, 5 and 6 have that.
 */
export const BEST_MATCH_TWO: ViralVideoProps = {
  // ⭐ The date, not the number. This is the one line a cold viewer can answer.
  hookText: "BORN 2nd, 11th, 20th OR 29th?",
  // ⭐ The ANSWER, in the 128pt line. Screen the accent, not the concept —
  // V40's accent consoled and buried its payload in the sub. This one pays off
  // the question immediately, which is what makes the frame worth saving.
  //
  // 🔴 12 CHARS IS NOT A STYLE CHOICE — IT IS THE COVER'S GEOMETRY.
  // The first cut ran "1 AND 7 MATCH BACK" (18 chars). On the video that is a
  // clean two-line accent, but the COVER stacks title + accent from a fixed
  // origin: 18 chars wraps to THREE lines, which lifts the whole block two
  // lines up and drives "BORN 2nd," straight through the Metatron lattice.
  // Rendered against `Viral-01-Identity-Seven-Cover` (1,418 views, the account's
  // #3 all-time) as the control: its accent "YOU'RE A 7" is ONE line and its
  // title clears the cube. Three candidates were rendered and compared —
  // "MATCH: 1 AND 7" still wrapped to two and still collided; "1 AND 7" and
  // "IT'S 1 AND 7" both reproduce V01's geometry exactly.
  // ⛔ Never take this accent past ~13 characters without re-rendering the cover.
  // 🪤 The `MOON` kicker is still half-buried in the cube — that is PRE-EXISTING
  // and V01's `KETU` does the same on the proven cover, so it is left alone
  // here rather than fixed as a second change. It is a real bug; it is not this
  // video's bug.
  hookAccent: "IT'S 1 AND 7",
  hookSub: "The only two that match you back",
  variant: "identity",
  number: 2,
  numberLabel: "MOON · 2, 11, 20, 29",
  /**
   * FIVE TRAITS, and the arc is: the count, the answer, a one-way you GIVE, a
   * one-way you GET, then the positive landing. ⭐ It ends on the counted good
   * news rather than the wound — the whole recent run ended on rejection and
   * the whole market ends on something the viewer can use.
   * ⛔ Trait 1 says "three others", not "four numbers": 2's friend row includes
   * itself, and "four" would contradict "only 1 and 7 say it back" in trait 2.
   */
  traits: [
    "You call three others a friend",
    "Only 1 and 7 say it back",
    "You like 9. 9 stays neutral",
    "4 likes you. You never noticed",
    "And no number dislikes a 2",
  ],
  // ⭐ Targeted share, not a generic one — names the two numbers the video just
  // handed the viewer, so the share has an address. The comment ask stays dead.
  ctaText: "Send this to your 1 or your 7",
  // `standard` = 19.6s, V36's structure.
  structure: { hook: 1.2, build: 0.8, value: 15.2, cta: 2.4 },
  palette: "sage-gold",
  layout: "centered",
  // 149.95 BPM, interval sd 4.8ms. The fresh 150 bed — quartzV20 went on V39.
  music: MUSIC.helixV19,
};

export const VIRAL_TEMPLATES = {
  "Viral-21-BestMatch-Two": BEST_MATCH_TWO,
  "Viral-20-LikedExceptTwo-Three": LIKED_EXCEPT_TWO_THREE,
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
  "Viral-11-BeliefCorrection-Two": BELIEF_CORRECTION_TWO,
  "Viral-12-BeliefCorrection-Seven": BELIEF_CORRECTION_SEVEN,
  "Viral-13-BeliefCorrection-One": BELIEF_CORRECTION_ONE,
  "Viral-14-OneWayMatch-Nine": ONE_WAY_MATCH_NINE,
  "Viral-15-OneWayMatch-Eight": ONE_WAY_MATCH_EIGHT,
  "Viral-16-OneWayMatch-Seven": ONE_WAY_MATCH_SEVEN,
  "Viral-17-OneWayMatch-Six": ONE_WAY_MATCH_SIX,
  "Viral-18-OneWayMatch-Five": ONE_WAY_MATCH_FIVE,
  "Viral-19-OneWayMatch-Four": ONE_WAY_MATCH_FOUR,
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
  // The accent carries the CORRECTION, not the belief — same split V03 uses
  // ("NUMBER 8 IS NOT" / "UNLUCKY"). At thumbnail size the accent is what reads
  // first, so it has to be the part that contradicts what the viewer expects.
  "Viral-11-BeliefCorrection-Two": {
    kicker: "Moon",
    title: "IF YOU'RE A NUMBER 2, YOU'RE",
    accent: "NOT WEAK",
    number: 2,
  },
  // Same accent-carries-the-correction split as V33 and V03. 🪤 The title says
  // "YOU'RE" and the accent completes it — the two are ONE sentence broken over
  // the split, so neither half reads on its own. Do not reword one without the
  // other.
  "Viral-12-BeliefCorrection-Seven": {
    kicker: "Ketu",
    title: "IF YOU'RE A NUMBER 7, YOU'RE",
    accent: "NOT COLD",
    number: 7,
  },
  "Viral-13-BeliefCorrection-One": {
    kicker: "Sun",
    title: "IF YOU'RE A NUMBER 1, YOU'RE",
    accent: "NOT ARROGANT",
    number: 1,
  },
  "Viral-14-OneWayMatch-Nine": {
    kicker: "Mars",
    title: "IF YOU'RE A NUMBER 9",
    accent: "THEY LIST YOU BACK",
    number: 9,
  },
  "Viral-15-OneWayMatch-Eight": {
    kicker: "Saturn",
    title: "IF YOU'RE A NUMBER 8",
    accent: "TWO DON'T LIST YOU BACK",
    number: 8,
  },
  "Viral-16-OneWayMatch-Seven": {
    kicker: "Ketu",
    title: "IF YOU'RE A NUMBER 7",
    accent: "2 LISTS YOU BACK",
    number: 7,
  },
  /**
   * 🔴🔴 FIRST COVER WRITTEN UNDER THE MATCHING RULE. The three entries above
   * still carry the DATA-STRUCTURE wording ("LIST") that the owner rejected on
   * 2026-08-13: `7145f0d` rewrote `hookAccent` on the video props and MISSED
   * this map, so V35-V37 shipped a video saying "THEY WANT YOU BACK" behind a
   * thumbnail saying "THEY LIST YOU BACK". Those three are left as the record
   * of what was published (owner: fix it from the next video, do not redo them)
   * and are named in the legacy exception list in `covers.test.ts`.
   * ⇒ From here on, `accent` MUST equal the video's `hookAccent`. The test
   * enforces it; a new concept cannot be added without them matching.
   */
  "Viral-17-OneWayMatch-Six": {
    kicker: "Venus",
    title: "IF YOU'RE A NUMBER 6",
    accent: "YOU DON'T WANT THEM",
    number: 6,
  },
  // Second cover under the matching rule — `accent` is `hookAccent` verbatim.
  "Viral-18-OneWayMatch-Five": {
    kicker: "Mercury",
    title: "IF YOU'RE A NUMBER 5",
    accent: "NOBODY WANTS 5 BACK",
    number: 5,
  },
  // Third cover under the matching rule — `accent` is `hookAccent` verbatim.
  /**
   * ⭐ Cover accent is pinned to `hookAccent` by covers.test.ts. It also breaks
   * the `IF YOU'RE A NUMBER n` opening that ran across nine consecutive grid
   * tiles — the grid is where the template is recognised, and `Viral-01`'s
   * `BORN ON THE 7th, 16th OR 25th?` (1,418 views) is the precedent.
   */
  "Viral-21-BestMatch-Two": {
    kicker: "Moon",
    title: "BORN 2nd, 11th, 20th OR 29th?",
    accent: "IT'S 1 AND 7",
    number: 2,
  },
  "Viral-19-OneWayMatch-Four": {
    kicker: "Rahu",
    title: "IF YOU'RE A NUMBER 4",
    accent: "YOU ARE NOT DISLIKED",
    number: 4,
  },
  /**
   * Fourth cover under the matching rule. ⭐ The first cover in the series that
   * does NOT open "IF YOU'RE A NUMBER n" — the grid is the surface where the
   * template is recognised, and eight consecutive posts carried that same line.
   * The `Viral-01` cover already set the precedent for a different opening.
   */
  "Viral-20-LikedExceptTwo-Three": {
    kicker: "Jupiter",
    title: "EVERYONE LIKES A 3",
    accent: "EXCEPT TWO",
    number: 3,
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
