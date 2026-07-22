import { MUSIC } from "../lib/brand";
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
  music: MUSIC.tribalRitual,
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
  music: MUSIC.darkMystical,
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
  music: MUSIC.dark,
};

export const VIRAL_TEMPLATES = {
  "Viral-01-Identity-Seven": IDENTITY_SEVEN,
  "Viral-02-Curiosity-Hidden": CURIOSITY_HIDDEN,
  "Viral-03-Contrarian-Eight": CONTRARIAN_EIGHT,
} as const;
