/**
 * The outward scan's two guards, each bought with a mistake already made.
 *
 * 🔴 An outward finding is a HYPOTHESIS, never a change. It enters the loop and
 * is tested against our own numbers. That discipline is what talked us out of
 * the conflict-framed compatibility reel — and the evidence then went the other
 * way, which is exactly why it is worth keeping.
 */
import { median } from "./windsor.mjs";

/** Beyond this, two posts have had such different lifetimes they cannot be compared. */
export const MAX_AGE_SKEW_DAYS = 7;

/**
 * ⭐⭐ Same-account control, always. Across accounts, follower count swamps the
 * signal. This is the method that showed compatibility posts at 51.9–57.2K
 * against the SAME account's 6.8–25.9K baseline.
 *
 * Returns null rather than a number when the comparison cannot be made — n=1 is
 * an anecdote, and an account with no other posts has no baseline.
 */
export const sameAccountLift = (posts, { format }) => {
  const mine = (posts ?? []).filter((p) => p.format === format);
  const others = (posts ?? []).filter((p) => p.format !== format);
  if (mine.length < 2 || others.length < 1) return null;

  const medianFormat = median(mine.map((p) => p.views));
  const medianBaseline = median(others.map((p) => p.views));
  // 🔴 BOTH sides, not just the baseline. `median` returns null when nothing
  // finite came back, and with only the baseline guarded a scan that measured
  // NO views for the format still reported `lift: 0` — "this format gets 0.0x
  // the baseline", maximally wrong and maximally confident, with n=2 beside it.
  // The outward scan scrapes other people's accounts through Chrome, where a
  // missing view count is ordinary, not corruption. Same fail-open shape as
  // rejectAgeSkew's unmeasurable skew: refuse to answer, never answer zero.
  if (medianFormat === null || !medianBaseline) return null;

  return {
    format,
    n: mine.length,
    medianFormat,
    medianBaseline,
    lift: Number((medianFormat / medianBaseline).toFixed(1)),
  };
};

/**
 * 🪤 Never compare posts of different ages. A 30-day-old post against a
 * 3-hour-old one once produced a false "the old format won" conclusion — the
 * old one had simply had a month to accumulate.
 */
export const rejectAgeSkew = (posts, asOf) => {
  const postCount = (posts ?? []).length;
  const ages = (posts ?? [])
    .map((p) => (new Date(asOf) - new Date(p.timestamp)) / 86_400_000)
    .filter((n) => Number.isFinite(n));

  // If fewer than 2 posts, nothing to compare — no skew possible.
  if (postCount < 2) return { ok: true, reason: null };

  // If 2+ posts but couldn't measure skew due to unparseable timestamps.
  if (ages.length < 2) {
    return {
      ok: false,
      reason: `age skew unmeasurable: ${postCount - ages.length} of ${postCount} timestamps could not be parsed`,
    };
  }

  const skew = Math.max(...ages) - Math.min(...ages);
  return skew > MAX_AGE_SKEW_DAYS
    ? { ok: false, reason: `age skew ${skew.toFixed(1)}d exceeds ${MAX_AGE_SKEW_DAYS}d` }
    : { ok: true, reason: null };
};
