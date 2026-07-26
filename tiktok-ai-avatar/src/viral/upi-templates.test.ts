import { describe, expect, it } from "vitest";
import { VALUE_BEATS } from "./UpiLaunch";
import { ACT } from "./timing";
import { UPI_COVERS, UPI_LAUNCH_EN, UPI_LAUNCH_HI, UPI_TEMPLATES } from "./upi-templates";

/**
 * Guards the three things about this video that are easy to break silently:
 * the beat grid, the price, and the language split.
 */

/** hardstyleV10 is 149.9 BPM; at 30fps that is a 12-frame beat. */
const BEAT = 12;
const MAX_LINE = 22; // chars, same ceiling as hooks.test.ts

describe("UPI launch — cut grid", () => {
  it("starts every value beat on a musical beat", () => {
    const offGrid = VALUE_BEATS.filter((f) => f % BEAT !== 0);
    expect(offGrid).toEqual([]);
  });

  it("tiles the value act exactly, with no gap or overlap", () => {
    expect(VALUE_BEATS[0]).toBe(ACT.valueStart);
    // Strictly increasing, and the last beat runs to the CTA.
    const bounds = [...VALUE_BEATS, ACT.ctaStart];
    const durations = bounds.slice(1).map((to, i) => to - bounds[i]);
    expect(durations.every((d) => d > 0)).toBe(true);
    expect(durations.reduce((a, b) => a + b, 0)).toBe(ACT.ctaStart - ACT.valueStart);
  });

  it("holds no single screen longer than 2.4s", () => {
    const bounds = [...VALUE_BEATS, ACT.ctaStart];
    const durations = bounds.slice(1).map((to, i) => to - bounds[i]);
    expect(Math.max(...durations)).toBeLessThanOrEqual(72);
  });

  it("fires an interrupt at least every 84 frames across the value act", () => {
    // INTERRUPT_EVERY is sec(2.8) = 84. The interrupts sit on VALUE_BEATS.
    const gaps = VALUE_BEATS.slice(1).map((f, i) => f - VALUE_BEATS[i]);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(84);
  });

  it("gives one caption per screen", () => {
    for (const t of Object.values(UPI_TEMPLATES)) {
      expect(t.captions).toHaveLength(VALUE_BEATS.length);
    }
  });
});

describe("UPI launch — price", () => {
  /**
   * Re-derives the displayed figure from the source values in
   * vedic-numerology/lib/commerce/regional-pricing.ts rather than trusting the
   * string. Duplicated rather than imported because that is a separate repo and
   * not a dependency here; if the GST rate or the base price changes there,
   * this test is what makes the video's number fail loudly instead of quietly
   * advertising a price we no longer charge.
   */
  const MONAD_BASE_PAISE = 30_000; // INDIA_PLAN_INR.monad.month
  const GST_RATE = 0.18; // INDIA_GST_RATE

  const indiaGrossPaise = (basePaise: number) => {
    const scaled = Math.round(100 * (1 + GST_RATE));
    return Math.round(((basePaise * scaled) / 100) / 100) * 100;
  };

  it("shows the GST-inclusive figure the site displays and Dodo charges", () => {
    const rupees = indiaGrossPaise(MONAD_BASE_PAISE) / 100;
    expect(rupees).toBe(354);
    expect(UPI_LAUNCH_EN.hookText).toContain(`₹${rupees}`);
    expect(UPI_LAUNCH_HI.hookText).toContain(`₹${rupees}`);
  });

  it("quotes the same price in both languages", () => {
    const price = (s: string) => s.match(/₹[\d,]+/)?.[0];
    expect(price(UPI_LAUNCH_EN.hookText)).toBe(price(UPI_LAUNCH_HI.hookText));
    expect(price(UPI_LAUNCH_EN.captions[0])).toBe(price(UPI_LAUNCH_HI.captions[0]));
  });
});

describe("UPI launch — copy rules", () => {
  it("keeps hook lines short enough not to wrap to three rows", () => {
    const tooLong = Object.entries(UPI_TEMPLATES).flatMap(([id, t]) =>
      [t.hookText, t.hookAccent]
        .filter((s) => s.length > MAX_LINE)
        .map((s) => `${id}: "${s}" (${s.length})`),
    );
    expect(tooLong).toEqual([]);
  });

  it("states the hook in 5-8 words across text + accent", () => {
    for (const [id, t] of Object.entries(UPI_TEMPLATES)) {
      const words = `${t.hookText} ${t.hookAccent}`.trim().split(/\s+/).length;
      expect(words, id).toBeGreaterThanOrEqual(5);
      expect(words, id).toBeLessThanOrEqual(8);
    }
  });

  it("never promises unlimited questions", () => {
    // Monad allows 2 AI follow-up questions/day and 5 readings/week. Any copy
    // implying otherwise is a promise a subscriber hits a wall against on day
    // one -- see the header of upi-templates.ts.
    const banned = /\ball (your )?questions\b|\bunlimited (questions|answers)\b|\bask anything\b/i;
    const everyString = Object.values(UPI_TEMPLATES).flatMap((t) => [
      t.hookText,
      t.hookAccent,
      t.hookSub,
      t.buildSetup,
      t.buildReveal,
      t.ctaText,
      ...t.captions,
    ]);
    expect(everyString.filter((s) => banned.test(s))).toEqual([]);
  });
});

describe("UPI launch — language split", () => {
  const DEVANAGARI = /[ऀ-ॿ]/;

  it("translates every caption-side string in the Hindi cut", () => {
    // The phone's screen copy is not in here on purpose -- it is baked into
    // CheckoutScreens.tsx and stays English in both cuts, because the real
    // payment page is English (messages/hi.json checkout.paymentInEnglishNote).
    const translated = [
      UPI_LAUNCH_HI.hookText,
      UPI_LAUNCH_HI.hookAccent,
      UPI_LAUNCH_HI.hookSub,
      UPI_LAUNCH_HI.buildSetup,
      UPI_LAUNCH_HI.buildReveal,
      UPI_LAUNCH_HI.ctaText,
      ...UPI_LAUNCH_HI.captions,
    ];
    expect(translated.filter((s) => !DEVANAGARI.test(s))).toEqual([]);
  });

  it("leaves the English cut free of Devanagari", () => {
    const english = [
      UPI_LAUNCH_EN.hookText,
      UPI_LAUNCH_EN.hookAccent,
      UPI_LAUNCH_EN.hookSub,
      UPI_LAUNCH_EN.buildSetup,
      UPI_LAUNCH_EN.buildReveal,
      UPI_LAUNCH_EN.ctaText,
      ...UPI_LAUNCH_EN.captions,
    ];
    expect(english.filter((s) => DEVANAGARI.test(s))).toEqual([]);
  });

  it("flags the Hindi cut so it picks up the Devanagari font stacks", () => {
    expect(UPI_LAUNCH_HI.hindi).toBe(true);
    expect(UPI_LAUNCH_EN.hindi).toBe(false);
  });

  it("shares the bed and the act structure between cuts", () => {
    expect(UPI_LAUNCH_HI.music).toBe(UPI_LAUNCH_EN.music);
    expect(UPI_LAUNCH_HI.variant).toBe(UPI_LAUNCH_EN.variant);
  });

  it("has cover copy for every composition", () => {
    expect(Object.keys(UPI_COVERS).sort()).toEqual(Object.keys(UPI_TEMPLATES).sort());
  });
});
