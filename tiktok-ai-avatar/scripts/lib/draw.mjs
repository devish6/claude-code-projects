/**
 * The monthly draw — nine distinct cards, one per Moolank, dealt at random.
 *
 * 🔴🔴 THE ONE RULE THIS FILE EXISTS TO ENFORCE: THERE IS NO CARD-TO-NUMBER
 * MAPPING, AND THERE MUST NEVER BE ONE. The product says so in its own code
 * (`vedic-numerology/lib/tarot/closing-lines.ts`):
 *
 *   "The card is deliberately NOT part of this mechanism — a card-number-to-
 *    driver rule would be invented numerology, and the source never makes
 *    that link."
 *
 * So the nine cards are DEALT, exactly as `lib/tarot/spread.ts` deals a
 * visitor's spread, and the post says so on its cover. A drawn card is an
 * honest thing to publish; an assigned one is a fact we made up.
 *
 * ⭐⭐⭐ WHY THE SEED IS RECORDED AND THE DRAW IS COMMITTED BEFORE THE COPY.
 * "Drawn once" is only true if the copy followed the draw. Committing the JSON
 * in its own commit, before a word of slide copy exists, is what makes that
 * checkable afterwards — the git history is the audit trail. ⛔ Never re-run a
 * draw because the cards "don't fit" the copy. That inverts the whole claim.
 *
 * The PRNG is FNV-1a + mulberry32, character for character the one in
 * `lib/tarot/spread.ts`, so a seed deals the same cards in both places.
 */

/** FNV-1a. Turns the seed string into a 32-bit integer for the PRNG. */
export function hashSeed(seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, deterministic. Not for cryptography; the seed is. */
export function prng(state) {
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MOOLANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Deal one distinct card per Moolank, in Moolank order.
 *
 * A partial Fisher-Yates over a copy of the deck — enough passes to fill nine,
 * which guarantees the nine are distinct without shuffling all 78.
 */
export function dealMonth(deck, seed) {
  if (deck.length < MOOLANKS.length) {
    throw new Error(`deck has ${deck.length} cards, need at least ${MOOLANKS.length}`);
  }
  const next = prng(hashSeed(seed));
  const d = [...deck];
  for (let i = 0; i < MOOLANKS.length; i++) {
    const j = i + Math.floor(next() * (d.length - i));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return MOOLANKS.map((moolank, i) => ({
    moolank,
    cardId: d[i].id,
    name: d[i].name,
    keywords: d[i].keywords,
    image: d[i].image,
  }));
}
