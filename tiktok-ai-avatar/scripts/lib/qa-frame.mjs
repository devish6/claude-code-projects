/**
 * Frame 1 must be legible. Pure maths over a raw greyscale dump.
 *
 * 🔴 WHY: we shipped an invisible first frame through `useSnap` once, and the
 * card reels open on a dark, low-contrast, near-static card. Both TikTok
 * retention curves die at 0:01, and the cold-open card glimpse is the prime
 * suspect. This is the cheapest possible check on the highest-value frame.
 *
 * 🪤 The cover image is NOT the lever — 66.4% of views arrive from the Reels
 * tab, where there is no cover and the video autoplays from frame 1. Covers
 * show only on the profile grid and Explore. Judge frame 1, not the cover.
 */

/** Minimum average luminance (0-255). A fade-from-black fails this. */
export const MIN_MEAN = 12;
/** Minimum spread. A flat frame carries no text and no subject. */
export const MIN_STDDEV = 18;

export const frameStats = (buffer) => {
  const n = buffer.length;
  if (!n) return { mean: 0, stddev: 0 };
  let sum = 0;
  for (const b of buffer) sum += b;
  const mean = sum / n;
  let sq = 0;
  for (const b of buffer) sq += (b - mean) ** 2;
  return { mean: Number(mean.toFixed(2)), stddev: Number(Math.sqrt(sq / n).toFixed(2)) };
};

export const judgeFirstFrame = ({ mean, stddev }) => {
  const pass = mean >= MIN_MEAN && stddev >= MIN_STDDEV;
  return {
    name: "frame 1 is legible",
    pass,
    detail: `mean ${mean} (min ${MIN_MEAN}) · stddev ${stddev} (min ${MIN_STDDEV})`,
  };
};
