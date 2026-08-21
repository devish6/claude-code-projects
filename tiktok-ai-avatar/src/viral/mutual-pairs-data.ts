import reel from "../../content/compatibility-reel.json";

/**
 * The `best-match` angle's mutual pairs, for the Pinterest pin.
 *
 * 🔴 NOTHING HERE IS AUTHORED. `reel.pairs` is written by
 * `scripts/derive-compatibility-pairs.mjs`, which parses
 * `vedic-numerology/lib/numerology/friendship.ts` and exits non-zero when the
 * two disagree. A pair qualifies only when BOTH rows name the other — the
 * one-way entries are excluded on purpose, which is the whole claim the pin
 * makes. Re-typing the list here would put an un-guarded copy on screen.
 *
 * ⛔ Do not hand-edit content/compatibility-reel.json. Run the script.
 */
export type MutualPair = { a: number; b: number; planets: string; why: string };

export const MUTUAL_PAIRS: MutualPair[] = reel.pairs as MutualPair[];

/**
 * ⚠️ LOAD-BEARING FOR THE NO-VERDICT RULE.
 *
 * The mutual list is a strong claim and roughly two-thirds of readers will not
 * find their pair on it. Without this line they read the pin as a verdict
 * against them — the same failure that got the Barnum hooks and the
 * conflict-pairs angle rejected. The prose lives in the JSON beside the pairs
 * so it cannot drift away from the claim it softens.
 *
 * ⛔ Do not cut the closing box to tidy the layout.
 */
export const CLOSING_LINE: string = reel.closing.line;
