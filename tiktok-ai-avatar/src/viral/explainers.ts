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
  ctaUrl: "numevix.com/try",
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
   * 📐 Built with:
   *   ffmpeg -ss 4 -t 14.24 -i <recording> \
   *     -vf "scale=1080:-2,crop=1080:1920:0:300" -an -r 30 ...
   * The crop drops the iOS status bar and keeps Safari's address bar, which is
   * what makes it read as a phone rather than a mockup. 429 frames at 30fps
   * against the composition's 427 — deliberately a hair long, so the backdrop
   * never runs out before the video does.
   */
  backdrop: { src: "site/numevix-chart-mobile.mp4", wash: 0.62, playbackRate: 0.65 },
  music: MUSIC.cipherV15,
  structure: { hook: 1.333, build: 0.444, value: 10.304, cta: 2.147 },
  palette: "mono",
  layout: "centered",
};

export const EXPLAINER_TEMPLATES = {
  "EXP01-FreeChart": EXPLAINER_FREE_CHART,
} as const;
