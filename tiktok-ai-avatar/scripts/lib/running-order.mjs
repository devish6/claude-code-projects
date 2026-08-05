/**
 * The order publish-next.mjs walks the queue in.
 *
 * 🪤 THIS LIVES IN lib/ SO IT CAN BE TESTED. publish-next.mjs does its work at
 * import time — reading the state file and choosing a video are top-level
 * statements, not a main() — so a test that imported it to reach this
 * comparator would run the publisher as a side effect.
 */

/** Card-reel ids are `M<number>R` — M8R is Moolank 8's reel. */
export const CARD_REEL_ID = /^M([1-9])R$/;

/**
 * Oldest date first; within a date, the order the programme actually runs.
 *
 * 🔴 CARD REELS RUN 9 DOWN TO 1, WHICH ALPHABETICAL ORDER GETS EXACTLY
 * BACKWARDS. Every reel queued in one sitting shares a date, so a plain
 * `localeCompare` tie-break put "M1R" ahead of "M9R" and Moolank 1 at the head
 * of a queue whose running order is 9, 8, 7… Instagram's own scheduler
 * (publish-next-card.mjs) descends, so the two publishers would have posted
 * DIFFERENT numbers on the same day — 8 on Instagram, 1 on the other three —
 * with nothing erroring to show it.
 *
 * ⭐ Only card-reel-vs-card-reel comparisons change. Everything else keeps the
 * ascending id order the V-series relies on, and because "M…" sorts before
 * "V…" alphabetically the two groups never interleave, so the comparator stays
 * transitive.
 */
export const byRunningOrder = (a, b) => {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  const ma = CARD_REEL_ID.exec(a.v);
  const mb = CARD_REEL_ID.exec(b.v);
  if (ma && mb) return Number(mb[1]) - Number(ma[1]); // 9 first, then 8, 7…
  return a.v.localeCompare(b.v);
};
