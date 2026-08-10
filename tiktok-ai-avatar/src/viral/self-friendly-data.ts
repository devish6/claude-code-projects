import reel from "../../content/compatibility-reel.json";

/**
 * The `self-friendly` angle's numbers.
 *
 * 🔴 NOTHING HERE IS AUTHORED. Every value is written into
 * `content/compatibility-reel.json` by `scripts/derive-compatibility-pairs.mjs`,
 * which parses `vedic-numerology/lib/numerology/friendship.ts` and exits
 * non-zero when the file and the table disagree. That is the whole trace: run
 * the script and the numbers on screen are provably the numbers the paid
 * readings use.
 *
 * ⛔ Do not hand-edit the JSON block and do not re-type these values here.
 * Unlike `card-data.ts` — which is a deliberate condensation of prose — these
 * are bare claims about the table, so a copy has nothing to add and everything
 * to drift.
 */
const d = reel.selfFriendlyDerived;

/** The eight numbers that list themselves as a friend. */
export const SELF_FRIENDLY: number[] = d.numbers;

/** The one that does not. */
export const NOT_SELF_FRIENDLY: number = d.exception;

/**
 * How the exception lists itself — "neutral" or "enemy".
 *
 * ⚠️ Load-bearing for the no-verdict rule. 7 is NEUTRAL to itself; saying it
 * clashes with itself would be a claim the table does not make and would leave
 * a verdict on every 7 reading the post.
 */
export const EXCEPTION_SELF_STATUS: string = d.exceptionSelfStatus;

/** The exception's own friends, so the card can point outward instead of stopping on a no. */
export const EXCEPTION_MATCHES: number[] = d.exceptionMatches;

/** Numbers whose only both-ways match is themselves. */
export const ONLY_SELF_MUTUAL: number[] = d.onlySelfMutual;
