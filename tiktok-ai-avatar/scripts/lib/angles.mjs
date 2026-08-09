/**
 * WHAT we say, chosen before HOW we say it.
 *
 * ⭐⭐⭐ WHY THIS ROLE EXISTS. The approved four-role design owned structure,
 * opening, measurement and QA — every one of them a question of delivery. But
 * the largest effect we have ever measured is the topic: on one competitor's
 * own account, compatibility posts did 51.9K-57.2K while everything else did
 * 6.8K-25.9K. Trait-per-number content — exactly what our card reels are — is
 * that format's weakest, and 205 views is what "our weakest format,
 * competently made" looks like. No amount of opening work fixes the wrong
 * subject.
 */
import { REPEAT_WINDOW_DAYS } from "./state.mjs";

/** Matches the hook no-repeat window — same reason, same rhythm. */
export const ANGLE_REPEAT_DAYS = REPEAT_WINDOW_DAYS;

const STATUSES = new Set(["approved", "hypothesis", "rejected"]);

export const validateAngle = (angle) => {
  const errors = [];
  if (!angle?.id) errors.push("no id");
  if (!angle?.evidence) errors.push("no evidence");
  if (!STATUSES.has(angle?.status)) errors.push(`unknown status: ${angle?.status}`);
  // 🔴 Formats are copyable. Facts are not.
  if (angle?.assertsFacts) errors.push("asserts numerology facts -- derive them instead");
  return { ok: errors.length === 0, errors };
};

const daysBetween = (a, b) => Math.abs(new Date(a) - new Date(b)) / 86_400_000;

const lastUse = (angle, state) =>
  (state?.videos ?? [])
    // 🔴 A FAILED render never used the angle — nothing went out, so nothing
    // can read as a repeat. state.mjs's isRecentlyUsed opens with exactly this
    // line for the hook window; without it here the two windows disagree and a
    // failed video would lock its angle out for 21 days over a post that never
    // existed. "Same reason, same rhythm" has to include the exclusions.
    .filter((v) => v.status !== "failed" && v.angleId === angle.id && v.date)
    .map((v) => v.date)
    .sort()
    .at(-1) ?? null;

export const isRecentlyUsedAngle = (angle, state, asOf) => {
  const last = lastUse(angle, state);
  return last !== null && daysBetween(last, asOf) <= ANGLE_REPEAT_DAYS;
};

/**
 * The approved angle that has gone longest unused, or null.
 *
 * Returning null rather than falling back to the freshest-anyway is
 * deliberate: repeating an angle inside the window is exactly the structural
 * sameness that made TikTok read our set as repeated content. An empty result
 * is a prompt to write a new angle, not a failure.
 */
export const pickAngle = (angles, state, asOf) => {
  // 🔴 A malformed entry USED TO BE FILTERED OUT SILENTLY, and that hid itself:
  // a shrunken pool returns null, and null already means "write a new angle".
  // So one missing `evidence:` read as "we are out of angles" and cost a whole
  // new angle instead of one character. The registry is config we author, not
  // input we receive -- a broken one is a bug to fix, never a pool to work
  // around.
  const invalid = (angles ?? [])
    .map((a) => ({ a, errors: validateAngle(a).errors }))
    .filter(({ errors }) => errors.length);
  if (invalid.length) {
    throw new Error(
      "content/angles.json has invalid entries -- " +
        invalid.map(({ a, errors }) => `${a?.id ?? "(no id)"}: ${errors.join(", ")}`).join("; "),
    );
  }

  const available = (angles ?? [])
    .filter((a) => a.status === "approved")
    .filter((a) => !isRecentlyUsedAngle(a, state, asOf));
  if (!available.length) return null;

  return available.sort((a, b) => {
    const la = lastUse(a, state);
    const lb = lastUse(b, state);
    if (la === lb) return a.id.localeCompare(b.id);
    if (la === null) return -1;
    if (lb === null) return 1;
    return la < lb ? -1 : 1;
  })[0];
};

/**
 * The angleIds the ledger uses that the registry does not define.
 *
 * ⭐⭐ `isRecentlyUsedAngle` joins on `v.angleId === angle.id` — an equality,
 * and a typo on either side of it does not throw. It just never matches, so an
 * angle published yesterday reads as never-used and the no-repeat window hands
 * it straight back. That is the exact rule this file exists to enforce,
 * failing open and saying nothing.
 *
 * An entry with NO angleId is history, not a defect: every row written before
 * the field existed has none, and inventing one after the fact would be a
 * fabricated measurement. Only a wrong id is reported.
 */
export const unknownLedgerAngles = (state, angles) => {
  const known = new Set((angles ?? []).map((a) => a.id));
  return [
    ...new Set(
      (state?.videos ?? [])
        .map((v) => v.angleId)
        .filter((id) => id && !known.has(id)),
    ),
  ];
};
