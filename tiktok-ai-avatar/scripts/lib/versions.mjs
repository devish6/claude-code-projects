import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * The newest rendered MP4 in a video's folder.
 *
 * 🪤 REPLACES `readdirSync(dir).filter(f => f.endsWith(".mp4")).sort().at(-1)`,
 * which was duplicated across all four publishers and is a lexicographic sort
 * on a numeric field. It is correct only while versions stay single-digit:
 * "…- v10.mp4" sorts BEFORE "…- v2.mp4", so the first time any video reaches
 * v10 every publisher silently posts v9 for ever after.
 *
 * That is a bad failure because nothing about it looks wrong — the publish
 * succeeds, a real video goes out, and the only symptom is that corrections
 * stop taking effect. Exports are versioned precisely so a re-render can
 * supersede a bad one; this quietly breaks that guarantee.
 *
 * Files with no `- vN` suffix sort oldest, so a hand-dropped mp4 can never
 * outrank a real render.
 */
export const versionOf = (filename) => {
  const m = filename.match(/- v(\d+)\.mp4$/i);
  return m ? Number(m[1]) : -1;
};

export const newestRender = (dir) => {
  const mp4s = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".mp4"));
  if (!mp4s.length) return null;
  const best = mp4s.reduce((a, b) => (versionOf(b) > versionOf(a) ? b : a));
  return join(dir, best);
};
