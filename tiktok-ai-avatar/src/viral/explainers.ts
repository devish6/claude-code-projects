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
export const EXPLAINER_FREE_CHART: ExplainerVideoProps = {
  hookText: "A FULL NUMEROLOGY CHART",
  hookAccent: "FOR FREE",
  // 🪤 "No account" is the product's word, and it is the friction that actually
  // stops people. Do not soften it to "free to try", which implies a trial.
  hookSub: "No account. One every day.",
  heroText: "NUMEVIX",
  heroSub: "Vedic numerology",
  traits: [
    // Each ≤26 characters — the measured single-line width at traitSize.
    "Driver and Conductor",
    "Your compound number",
    "The numbers you're missing",
    "Your Vedic grid",
    "And your forecast",
  ],
  // 🪤 No 👇 — CTAEnding draws its own arrow.
  ctaText: "Free chart, no account",
  ctaUrl: "numevix.com/try",
  music: MUSIC.cipherV15,
  structure: { hook: 1.333, build: 0.444, value: 10.304, cta: 2.147 },
  palette: "mono",
  layout: "centered",
};

export const EXPLAINER_TEMPLATES = {
  "EXP01-FreeChart": EXPLAINER_FREE_CHART,
} as const;
