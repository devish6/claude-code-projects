import { MUSIC } from "../lib/brand";
import type { UpiLaunchProps } from "./UpiLaunch";

/**
 * The UPI launch announcement — V13 (English) and V14 (Hindi).
 *
 * Dodo went live for India on 2026-07-26, so numevix.com takes UPI, GPay,
 * PhonePe, Paytm and netbanking instead of card-only. This announces it.
 *
 * The video leads with the PRICE and lands UPI as the payoff, not the other way
 * round: ₹354 is the thing that stops an Indian viewer mid-scroll, and UPI is
 * what removes the friction from acting on it. A UPI-first cut announces
 * plumbing to people who have not yet decided they want the product.
 *
 * ⚠️ THREE COPY CONSTRAINTS, each of which the obvious draft violates. See
 * docs/specs/2026-07-26-upi-launch-video-design.md.
 *
 * 1. NO "all your questions answered". Monad allows 2 AI follow-up questions
 *    per day and 5 readings a week (messages/en.json, pricing.highlights.monad).
 *    A viewer who signs up on that promise hits a wall on their third question.
 *    The approved framing sells BREADTH — career, money, marriage, health — a
 *    claim about what a reading covers, which is true, and which promises
 *    nothing about volume.
 *
 * 2. NO invented statistics. "India could only pay by card" is checkable. A
 *    decline rate or a conversion lift would not be; nothing here has measured
 *    one.
 *
 * 3. The Hindi cut translates ONLY the captions. Screen copy inside the phone
 *    stays English because the real payment page is English — see the warning
 *    in components/CheckoutScreens.tsx.
 */

/** ₹354 = indiaGrossPaise(INDIA_PLAN_INR.monad.month). Re-derived in the test. */
const PRICE = "₹354";

/**
 * Shared between both cuts, so a change to the beat structure can't drift
 * between languages. Only strings differ below.
 */
const BASE = {
  variant: "identity" as const,
  music: MUSIC.hardstyleV10,
};

/** ENGLISH — V13 */
export const UPI_LAUNCH_EN: UpiLaunchProps = {
  ...BASE,
  // 17 chars; the hook copy rule is a 22-char ceiling per line, above which
  // 112px type wraps to three rows.
  hookText: `JUST ${PRICE} A MONTH`,
  hookAccent: "IN INDIA",
  hookSub: "And now you can pay by UPI",
  buildSetup: "Career, money, marriage, health…",
  buildReveal: "All read from one birth date.",
  captions: [
    `${PRICE} a month. GST included.`,
    "Pay with the app you already use",
    "Approve it in two seconds",
    // NOT "no forex fee". That is a claim about the viewer's issuing bank,
    // which we cannot verify — and INR was already the charge currency under
    // Stripe (currency_options), so it would imply a change that didn't
    // happen. What actually changed is that no card is needed at all.
    "Done — no card needed",
  ],
  ctaText: "Pay with UPI",
  hindi: false,
};

/**
 * HINDI — V14.
 *
 * Follows the app's own Hindi copy policy: transliterate the English product
 * terms rather than inventing Sanskritised equivalents, because that is what
 * the site itself does and what the audience actually says. "UPI", "GST",
 * "GPay" stay Latin. The ₹ figure is identical — it is the same price.
 */
export const UPI_LAUNCH_HI: UpiLaunchProps = {
  ...BASE,
  hookText: `सिर्फ़ ${PRICE} महीना`,
  hookAccent: "भारत में",
  hookSub: "और अब UPI से पेमेंट कीजिए",
  buildSetup: "करियर, पैसा, शादी, सेहत…",
  buildReveal: "सब एक जन्मतिथि से।",
  captions: [
    `${PRICE} महीना। GST शामिल।`,
    "उसी ऐप से जो आप रोज़ चलाते हैं",
    "दो सेकंड में अप्रूव कीजिए",
    "हो गया — कार्ड की ज़रूरत नहीं",
  ],
  ctaText: "UPI से पेमेंट कीजिए",
  hindi: true,
};

export const UPI_TEMPLATES = {
  "Viral-13-UPI-Launch": UPI_LAUNCH_EN,
  "Viral-14-UPI-Launch-Hindi": UPI_LAUNCH_HI,
} as const;

/**
 * Cover copy. Shorter than the hook — a thumbnail is read at a glance in a
 * grid, not at full size. The watermark is "UPI" rather than a moolank, which
 * is why ViralCover's `number` accepts a string.
 */
export const UPI_COVERS: Record<
  keyof typeof UPI_TEMPLATES,
  { kicker: string; title: string; accent: string; number: string }
> = {
  "Viral-13-UPI-Launch": {
    kicker: "India",
    title: `JUST ${PRICE} A MONTH`,
    accent: "PAY BY UPI",
    number: "UPI",
  },
  "Viral-14-UPI-Launch-Hindi": {
    kicker: "भारत",
    title: `सिर्फ़ ${PRICE} महीना`,
    accent: "UPI से पेमेंट",
    number: "UPI",
  },
};
