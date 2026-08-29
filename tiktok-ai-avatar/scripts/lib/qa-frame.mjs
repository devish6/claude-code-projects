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

/**
 * How far a frame's spread may fall below the video's own median before it
 * counts as collapsed.
 *
 * ⛔ THIS IS RELATIVE ON PURPOSE, AND IT IS NOT `MIN_STDDEV`. Those floors are
 * calibrated on the LIGHT sage-gold format (frame means ~167) and the kinetic
 * format is legitimately dark — its night-ground scenes settle around mean 16.
 * The best post this account ever published fails the absolute floors on 46%
 * of its frames. Never widen this by tuning MIN_MEAN or MIN_STDDEV; a video is
 * judged against itself here.
 */
export const COLLAPSE_RATIO = 0.35;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Every frame must carry content, not just frame 0.
 *
 * 🔴 WHY: `judgeFirstFrame` reads frame 0 and nothing else, so two multi-frame
 * holes have shipped straight through it — V33's 2.13s of blank screen at
 * 15.5s, and the kinetic scene-entry blackout measured on V48 (frame 56 at
 * 0.19% non-black, on the payload beat, on six consecutive cuts).
 */
export const judgeEveryFrame = (frames) => {
  const name = "every frame carries content";
  if (!frames.length) return { name, pass: false, detail: "no frames" };

  const floor = median(frames.map((f) => f.stddev)) * COLLAPSE_RATIO;
  let run = 0;
  let worstRun = 0;
  let worstAt = -1;
  for (const [i, f] of frames.entries()) {
    if (f.stddev >= floor) {
      run = 0;
      continue;
    }
    run += 1;
    if (run > worstRun) {
      worstRun = run;
      worstAt = i - run + 1;
    }
  }

  if (!worstRun) {
    return { name, pass: true, detail: `${frames.length} frames, none under stddev ${floor.toFixed(2)}` };
  }
  return {
    name,
    pass: false,
    detail: `${worstRun} frames from frame ${worstAt} under stddev ${floor.toFixed(2)} (of ${frames.length})`,
  };
};
