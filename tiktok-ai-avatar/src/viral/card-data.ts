/**
 * Moolank reference-card data — the 12 fields of the saveable info-card.
 *
 * ⭐ WHY THIS FORMAT EXISTS
 * Our reels reach ~180 strangers a post and earn 0–1 saves. Reference post #2
 * (`the_astrological_d`, 2026-08-04) is a single static card of 12 labelled
 * fields and earns 42 shares on only 13 comments — because it is a KEEPSAKE.
 * Nothing is withheld, so there is something worth keeping. A reel shows four
 * traits for 1.4s and vanishes.
 *
 * 🔴 SOURCE OF TRUTH, AND WHY THIS IS A COPY
 * Every value here is condensed from
 * `vedic-numerology/lib/numerology/interpretations/birth-number.ts` — the same
 * table that feeds the paid readings and the public /birth-number pages. That
 * is deliberate: a card that contradicted the product would be worse than no
 * card. It is DUPLICATED rather than imported because `vedic-numerology` is a
 * separate private repo, exactly as the ₹354 figure was duplicated for the UPI
 * video. `card-data.test.ts` pins the values that must not drift.
 *
 * ✂️ The source fields are full sentences written for a web page. A card has
 * room for a phrase, so each is condensed — but only condensed. No claim here
 * is absent from the source.
 *
 * 🩹 `shadow` follows the standing safety softening (see V06's "angry 9"):
 * a shadow side is described as an energy to manage, never as a verdict on the
 * reader. These cards are read by people born on that date.
 */
import CARDS from "../../content/moolank-cards.json";


export type MoolankCard = {
  number: number;
  /** "The Builder" — the archetype, without the "Birth Number 8 —" prefix. */
  archetype: string;
  planet: string;
  /** ⭐ EVERY qualifying date, never just the first. See the date-list hook rule. */
  bornOn: string;
  element: string;
  /** One line. What this number is like to be. */
  personality: string;
  strengths: string[];
  /** The inner lesson — from `spiritual`. */
  innerWorld: string;
  relationships: string;
  career: string;
  shadow: string[];
  luckyColours: string[];
  /** The friendly numbers from the engine's FRIENDSHIP table, not the birth dates. */
  luckyNumbers: number[];
  luckyDay: string;
  /**
   * The ruling planet's beej mantra.
   *
   * 🔴 THE ONE FIELD NOT DRAWN FROM THE APP'S RULESET. Every other value here
   * condenses `birth-number.ts`; these are standard Vedic planetary
   * correspondences. That is the same basis the source file itself cites for
   * lucky colours, days and elements ("standard planetary correspondences
   * (deterministic)"), so the precedent is the source's own — but it is worth
   * knowing this field cannot be checked against a paid reading the way the
   * others can.
   *
   * ⭐ WHY IT EARNS ITS PLACE: to a majority-Indian audience "Daily Remedy"
   * means an *upaay* — a mantra, a colour, a donation, a fast day. The
   * behavioural advice that sat here first read as a productivity tip and
   * landed flat. This is the most saveable line on the card.
   */
  mantra: string;
  /** The practice that goes with the mantra — count, day, colour, donation. */
  remedy: string;
};

/**
 * 🪤 THE DATA LIVES IN JSON, NOT HERE, AND THAT IS LOAD-BEARING.
 * The Remotion card is TypeScript; the Instagram publisher that writes the
 * caption is `.mjs`, and **`.mjs` cannot import `.ts`**. That mismatch has
 * already broken this repo three times (the compositionId duplication). A JSON
 * file is the one format both sides read, so the card and its caption can never
 * describe different numbers.
 */
export const MOOLANK_CARDS = CARDS as unknown as Record<number, MoolankCard>;

export const MOOLANK_NUMBERS = Object.keys(MOOLANK_CARDS).map(Number);
