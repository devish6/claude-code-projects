import { MUSIC } from "../lib/brand";
import type { ExplainerVideoProps } from "./ExplainerVideo";

/**
 * EXP01 — the promoted consumer explainer. TikTok, $13/day Promote.
 *
 * 🔴 NOT A V-NUMBER, and that is a decision, not an oversight (owner, 2026-08-12).
 * V-numbers are coupled to `content/angles.json`: `pickAngle`'s 21-day window and
 * the no-recycled-ideas rule both key off `angleId`. This video has no angle — it
 * is a product explainer, not numerology content — so a V-number would put an
 * un-angled row into the sequence that machinery reads. Own prefix, like PIN01.
 * ⇒ Its ledger row carries NO `angleId`. `unknownLedgerAngles` allows that on
 * purpose; inventing one would be a fabricated measurement.
 *
 * 🎯 AUDIENCE IS CONSUMERS, NOT PRACTITIONERS (owner, 2026-08-12). The
 * practitioner cut is parked until Numevix Studio is close to real — it had no
 * destination, and TikTok Promote cannot target an occupation anyway.
 *
 * ⚠️ ACCEPTED WITH EYES OPEN: we are paying to amplify a funnel with a measured
 * 0–1s leak. Every TikTok post reads *"most viewers stopped watching at 0:01"*,
 * 1.7–2.0s average watch, 0 comments in the account's entire history. Promotion
 * buys impressions into that; it does not fix the first second. Owner's call.
 * ⛔ Do not re-litigate this in a future session.
 *
 * 🔴 EVERY CLAIM IS THE PRODUCT'S OWN COPY, read off the live app 2026-08-12:
 * `app/try/page.tsx` — *"One free chart per day, no account needed."*
 * `app/try/anon-chart.tsx` — the free chart returns Driver/Basic,
 * Conductor/Destiny, Compound, Missing, Combinations/Yogas, the grid, a forecast,
 * and is labelled *"Free preview chart, not saved."*
 * ⛔ NEVER imply the AI reading is free. It sits behind `/api/claim` — a free
 * ACCOUNT — and the bullets below deliberately do not mention it.
 * ⛔ "Vedic grid", never "Lo Shu".
 *
 * 📐 `snap` (14.2s class), the shortest structure in the pool. Shorter does NOT
 * improve the hook — that is settled, 32s→12s bought 0.4s of attention — but it
 * does improve the completion metric, and on a PROMOTED video the delivery system
 * reads that metric. This is the one place where using length as a lever is
 * honest rather than self-deception.
 *
 * ⚠️ Acts are cipherV15 TRACKED beats. Payload holds at frame 53 (1.777s), the
 * same beat V30/V32/V33 pay out on — proven, and it keeps the opening comparable
 * across everything we ship. Value ends on the 12.081s beat (362), total on
 * 14.228s (427). Value is 309 frames → hero 78, five bullet scenes, montage 49.
 *
 * 🎨 `mono` (the light palette). Not the V-series palette experiment — this video
 * is promoted and lives outside that sequence, so it cannot confound it. Chosen
 * because high contrast reads better for text-heavy explainer copy in feed.
 * Fingerprint `snap|140|centered|mono` is unused in the 14-day window.
 */
/**
 * 🎯 VOCABULARY IS THE TARGETING (owner, 2026-08-12: "target bigger audience,
 * use birth number / life path number type words").
 *
 * The first cut said "Driver and Conductor" and "your compound number" — our
 * INTERNAL ruleset vocabulary, which almost nobody searches. `birth number` and
 * `life path number` are the terms the audience actually uses, and on a PROMOTED
 * video the on-screen text and caption are what the platform indexes.
 *
 * ⭐⭐ THE RELABEL IS EXACT, NOT MARKETING. Verified in
 * `modules/numerology-engine/core.ts`, which names them itself:
 *   `computeDriver`    — "Driver / Root / Mulank: reduce the birth day"      → BIRTH NUMBER
 *   `computeConductor` — "Conductor / Destiny / Life-Path: reduce the compound" → LIFE PATH
 * ⛔ Never relabel a number without re-reading that file. Calling the Driver a
 * "life path number" would be flatly wrong — it is the day, not the whole date.
 *
 * 🪤 "Your Vedic grid" is DELIBERATELY NOT broadened. It is the standing brand
 * term ("Vedic grid", never "Lo Shu") and renaming it is the owner's call, not a
 * copy decision. It is the one niche phrase left in the video.
 *
 * ⚠️ "Your next 5 years" is measured, not a flourish: `app/try/page.tsx` calls
 * `computeForecastRange` with `{ fromYear: thisYear - 1, toYear: thisYear + 4 }`,
 * so from today forward that is exactly five years. ⛔ Do not write "to 2030" —
 * the range is relative and would date the video.
 */
export const EXPLAINER_FREE_CHART: ExplainerVideoProps = {
  hookText: "YOUR BIRTH NUMBER",
  hookAccent: "AND LIFE PATH",
  // 🪤 "No account" is the product's word, and it is the friction that actually
  // stops people. Do not soften it to "free to try", which implies a trial.
  hookSub: "Free. No account needed.",
  heroText: "NUMEVIX",
  heroSub: "Vedic numerology",
  traits: [
    // Each ≤26 characters — the measured single-line width at traitSize.
    // 1 and 2 repeat the hook ON PURPOSE: in a 14s promo the two search terms
    // are the payload, and repeating them feeds the platform's text indexing.
    "Your birth number",
    "Your life path number",
    "The numbers you're missing",
    "Your Vedic grid",
    "Your next 5 years",
  ],
  // 🪤 No 👇 — CTAEnding draws its own arrow.
  ctaText: "Free chart, no account",
  /**
   * 🔴 THE BARE DOMAIN ON SCREEN, THE DEEP LINK IN THE CLICK (owner, 2026-08-12).
   * A path is noise on a card nobody can tap — it is read, half-remembered and
   * typed, so it has to be the shortest thing that works. `numevix.com` reaches
   * the free-chart CTA anyway.
   * 🪤 This is NOT the destination. `utmLinks.tiktok` still points at
   * `/try?utm_...`, which is where the tap actually lands, and it must stay
   * deep-linked — the video promises a free chart with no account, and the
   * homepage makes that one click further away. ⛔ Do not "make them match".
   */
  ctaUrl: "numevix.com",
  /**
   * The owner's own iPhone recording of numevix.com/try, behind a wash.
   *
   * ⭐⭐ A REAL RECORDING, NOT A SYNTHESISED SCROLL (owner shot it 2026-08-12).
   * The motion is a person actually browsing — momentum flicks, small pauses —
   * and that is most of why it reads as a real product rather than a slideshow.
   *
   * ⭐ IT ALSO PROVES THE COPY. The bullets name Driver/Basic, Conductor/Destiny,
   * Compound, Missing, Combinations/Yogas, the grid and the forecast; the footage
   * shows every one of them, and the forecast list visibly runs 2025-2026 through
   * 2030-2031 — which is the "Your next 5 years" bullet, on screen, in the product.
   *
   * 🔴 SOURCE TRIM IS A PRIVACY EDIT, NOT A CREATIVE ONE. Both raw recordings end
   * with the iOS Control Center pulled down, showing the owner's Wi-Fi network
   * name and battery level. The asset is cut 4.0s–18.24s to exclude it (and the
   * on-screen keyboard at the head). ⛔ Never re-cut from the raw file without
   * re-checking the tail.
   * 🔴 The chart is a DEMO — "Sarah Scott", 2001-05-30 — so no real birth data is
   * published. ⛔ Never rebuild this asset from a chart belonging to a real person.
   *
   * 📐 THE SOURCE WINDOW IS CHOSEN, NOT ARBITRARY — 11.3s to 18.7s of the raw
   * recording, the only stretch where the CHART stays on screen. Owner, 2026-08-12:
   * the backdrop must be the chart for the whole video. The earlier 4.0s window
   * drifted onto the forecast list and the "Want your full AI reading?" panel for
   * most of the middle, which is both off-message and the one thing in frame that
   * could imply the AI reading is free. ⛔ Do not widen this window without
   * re-checking what is actually on screen behind every text beat.
   *   ffmpeg -ss 11.3 -t 7.4 -i <recording> \
   *     -vf "scale=1080:-2,crop=1080:1920:0:300" -an -r 60 ...
   * The crop drops the iOS status bar and keeps Safari's address bar, which is
   * what makes it read as a phone rather than a mockup.
   *
   * ⭐⭐ 0.5x IS AN EXACT RATIO, NOT A TASTE CALL. A 7.4s window has to cover a
   * 14.23s video, which forces the rate to ~0.5 — and 0.5 from a 60fps source is
   * exactly 30 distinct frames per second of 30fps output, so every output frame
   * gets its own source frame and the scroll cannot judder. The previous 0.65x was
   * ~39/30: smooth, but it consumed 9.25s of source and no 9.25s window stays on
   * the chart. ⇒ The constraint and the smoothest rate happened to agree.
   */
  backdrop: { src: "site/numevix-chart-mobile.mp4", wash: 0.62, playbackRate: 0.5 },
  music: MUSIC.cipherV15,
  structure: { hook: 1.333, build: 0.444, value: 10.304, cta: 2.147 },
  palette: "mono",
  layout: "centered",
};

/**
 * LIVE01 — the promo for the TikTok Live on Sat 22 Aug, 7:00–7:30pm ET.
 *
 * 🔴 IT MUST POST THU 20 AND FRI 21. The Live is Saturday, so a promo built any
 * later than Wednesday cannot run twice before the event, and a single showing
 * of an event promo is a wasted event.
 *
 * 🔴 NOT A V-NUMBER, for the same reason EXP01 is not: V-numbers are coupled to
 * `content/angles.json`, and both `pickAngle`'s 21-day window and the
 * no-recycled-ideas rule key off `angleId`. This is an event promo with no
 * numerology angle, so a V-number would put an un-angled row into the sequence
 * that machinery reads. Own prefix, like EXP01 and PIN01.
 *
 * ⭐⭐⭐ THE BIRTH YEAR IS THE PRICE OF ENTRY, NOT A POLITE ASK (owner, 2026-08-18).
 * The ask lands in the HERO beat at 2.0s, not in the CTA. Reason, measured: the
 * last five reels returned **0 comments between them** across every platform, and
 * V39's retention shows only **16.9% of viewers still there at 3s** — so a CTA at
 * 25s is addressed to almost nobody.
 *
 * 🪤🪤 THE STRUCTURE DOES NOT CONTROL THAT, AND I FIRST WROTE THAT IT DID.
 * The initial cut chose `snap` "because it is the only structure whose hero beat
 * opens at 2.0s". That is false: the Cycle-1 re-cut of 2026-08-09 set
 * `hook 1.2 + build 0.8` in **all four** structures precisely so the payload lands
 * on frame 60 every time. I read the pool instead of comparing it.
 * ⭐⭐⭐ **Read the list, and you will find the reason you went looking for.**
 *
 * ⇒ With the 2.0s ask free either way, the structure is chosen on READABILITY, and
 * that decides it against `snap`. Measured with `planViralVideo`, not estimated:
 * `snap` plans pair scenes of [28,42,28,42,28] frames — **0.93s on a 24-character
 * line**, which is ~190wpm with no pause. `essay` affords far more. The owner's
 * 2026-08-18 direction is explicit — *"humanized, emotional and easily
 * understandable… slower if that buys context"* — and "a shorter cut holds more"
 * is already recorded DEAD (32s→12s bought 0.4s of attention). ⛔ Do not re-cut
 * this to `snap` for completion rate; the trait lines become unreadable.
 *
 * ⭐ THE DEFAULT 👇 GLYPH IS CORRECT HERE, AND IT IS THE INVERSE OF V40.
 * V40 passed `ctaGlyph: "👉"` because a SHARE ask must point at the right action
 * rail. This video's whole mechanic IS a comment, so `CTAEnding`'s default 👇 —
 * pointing straight at the comment box — is the load-bearing choice. ⛔ Do not
 * "fix" this to 👉 for consistency with the V-series.
 *
 * 🔴 EVERY CLAIM READ OFF THE PRODUCT, NOT MEMORY (prod DB, 2026-08-19).
 * `Product.annual-forecast` describes itself as *"A full year ahead, read through
 * your Mahadasha and Antardasha planetary cycles… how energy shifts across the
 * four QUARTERS"*. ⇒ the trait says **quarter by quarter**. The first draft said
 * "month by month", which would have been a false claim about our own report.
 * ⛔ It is the **Annual Forecast**. NEVER "Annual Report" — the TikTok event copy
 * gets this wrong and the video must not inherit the error.
 *
 * 🪤 "7PM ET" IS SPELLED OUT ON PURPOSE. 7pm Eastern is 4:30am IST, and 15 of our
 * 49 mailable users are in India. A bare "7pm" would have Indian viewers arrive
 * twelve hours late to an empty stream. Stating the zone does not fix the
 * scheduling problem — that is the owner's call — but it stops the video causing it.
 *
 * 🔴🔴 DO NOT POST THIS UNTIL THE 50% COUPON EXISTS AND IS TESTED ON **BOTH**
 * PROCESSORS. The video promises "everyone else: 50% off", and no discount has
 * ever been exercised on the Dodo path — which is the path every Indian buyer
 * takes. A percentage is the safe shape (`amount_off` breaks INR), but shape is
 * not existence. Posting first would send viewers to a code that does not apply.
 *
 * 🎨 Fingerprint `essay|128|centered|mono`, checked against `daily-state.json`'s
 * 14-day window: `essay` has shipped at 140 and 150 but never at 128, and no essay
 * has ever run on `mono`. V40 was `stack`, so the previous-layout rule passes.
 * `mono` is the light palette EXP01 chose for text-heavy offer copy, and it keeps
 * the promos visually separate from the V-series so neither confounds the other's
 * measurement.
 *
 * 🪤🪤 IT WAS BUILT ON `fullbleed` FIRST — WHICH HAS NEVER SHIPPED — AND RENDERING
 * IT IS THE ONLY REASON THAT IS NOT WHAT SHIPPED. Two defects, both invisible to
 * every gate (qa:frame PASSED, the 84-frame scan was clean, trait coverage was
 * full, tsc and 475 tests green):
 *   1. **A 24-character trait ORPHANED its last word** — "Three of you get it free"
 *      broke as *"Three of you get it" / "free"*. ⇒ `fullbleed`'s real one-line
 *      ceiling is **~19 characters**, not the ~25 recorded for it. I took that
 *      number from V40's note instead of measuring it here.
 *   2. **The CTA rendered ON TOP OF the mandala** — black type across the gold
 *      graphic — and orphaned "year" as well.
 * ⭐⭐⭐ The fix is the LAYOUT, not shorter copy. V40 established that the char
 * ceiling guards against an ORPHAN, not against a second line, and that enforcing
 * it as a hard trait limit is what made V33–V39 read like telegrams. `centered` has
 * a measured ~26 ceiling, so every line here fits on one at its natural length —
 * and the fingerprint stays unused either way, so nothing was traded for it.
 * ⛔ Do not move this back to `fullbleed` without re-rendering and LOOKING at both
 * a trait frame and the CTA frame.
 * 🪤 BED CHECKED ON DURATION, THE WAY V40'S WAS. `pulseV13` is 128.15 BPM (matching
 * the 128 tempo) and **32.078s measured with ffprobe** against a 23.4s cut — no
 * silence under the CTA. ⛔ Do not swap in a 25s bed without re-measuring.
 *
 * 🪤 NO BACKDROP, DELIBERATELY. EXP01's backdrop is a recording of a CHART, which
 * is off-message for an event promo and would put the product page behind copy
 * about a livestream. `AstrolBackground` carries it instead.
 */
export const EXPLAINER_LIVE_PROMO: ExplainerVideoProps = {
  hookText: "YOUR 2027, READ LIVE",
  // 17 chars. The giveaway is the strongest thing we have, and this is an event
  // promo — there is nothing to be gained by burying it.
  hookAccent: "THREE OF YOU FREE",
  hookSub: "Saturday, 7pm Eastern",
  // ⭐ THE ASK, at 2.0s. Not in the CTA. See the note above.
  heroText: "YOUR BIRTH YEAR",
  heroSub: "Comment it to enter",
  traits: [
    // Trait COUNT is a floor set by the plan, not a preference: `essay`'s value
    // act plans N pair scenes, and fewer traits than scenes ships the
    // blank-screen hole `checkTraitCoverage` exists to block. Verified with
    // planViralVideo below, not assumed.
    // Each <= 24 chars, inside `centered`'s measured ~26 single-line ceiling —
    // verified by rendering and looking, not by trusting the recorded number.
    "The Annual Forecast",
    // The product's own word for what it does. Verified against the prod row.
    "Quarter by quarter",
    "Three of you get it free",
    // ⛔ Never phrase this as a discount on a SUBSCRIPTION. It is 50% off one
    // fixed-cost report. Monad is never named, never discounted.
    "Everyone else: 50% off",
    "Live Sat 22 Aug, 7pm ET",
  ],
  /**
   * 16 chars — and the CTA slot has its OWN, SMALLER ceiling than a trait.
   *
   * 📐 MEASURED BY RENDERING, IN TWO STEPS. "Follow + comment your year" (26)
   * orphaned "year"; "Follow + comment below" (22) still orphaned "below", on a
   * layout whose TRAIT lines hold 24 comfortably. ⇒ CTA type is set larger, so
   * ~26 is a trait number and must never be reused here. The CTA ceiling is
   * **~16–17 characters**.
   *
   * ⛔ It does not need to say what to comment: the HERO beat says "YOUR BIRTH
   * YEAR / Comment it to enter" at 2.0s, and the default 👇 points at the box.
   */
  ctaText: "Follow + comment",
  // ⛔ No ctaGlyph — the default 👇 is the correct one here. See above.
  music: MUSIC.pulseV13,
  structure: { hook: 1.2, build: 0.8, value: 18.8, cta: 2.6 },
  palette: "mono",
  layout: "centered",
};

export const EXPLAINER_TEMPLATES = {
  "EXP01-FreeChart": EXPLAINER_FREE_CHART,
  "LIVE01-TikTokLive": EXPLAINER_LIVE_PROMO,
} as const;
