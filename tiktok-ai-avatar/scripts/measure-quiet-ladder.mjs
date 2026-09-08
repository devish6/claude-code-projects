#!/usr/bin/env node
/**
 * node scripts/measure-quiet-ladder.mjs <mp4> <hold-seconds-csv>
 *
 *   node scripts/measure-quiet-ladder.mjs out/V58-who-you-used-to-be.mp4 2.9,2.6,2.5,2.9,2.9,2.8
 *
 * Reads the RENDERED cut and reports the luma ladder it actually delivers —
 * per scene, one region, one method, all six.
 *
 * ⭐⭐⭐ WHY THIS IS A SCRIPT AND NOT A NOTE IN A DOC. V58's first render was
 * measured by hand, and the numbers that came out were not comparable: the
 * spec's targets were FULL-FRAME, PRE-SCRIM plate means, and the render was
 * measured on post-scrim centre crops. Codex caught it — comparing a 77-point
 * designed span against those is not a like-for-like test. So the region and
 * the method are fixed here, in one place, and the same ones are used for every
 * scene of every cut from now on.
 *
 * 🪤 SAMPLED AT THE MIDPOINT OF EACH HOLD, never near a boundary. Scenes overlap
 * by one `DISSOLVE`, so a frame taken inside that window is a blend of two
 * grounds and belongs to neither scene.
 *
 * The pass this reports on is the ARC, not legibility — `checkTextContrast`
 * owns legibility and runs before a frame is drawn. What this can see and no
 * unit test can is whether the delivered descent survived the renderer.
 */
import { spawn } from "node:child_process";

const [, , path, holdsArg] = process.argv;
if (!path || !holdsArg) {
  console.error("usage: node scripts/measure-quiet-ladder.mjs <mp4> <hold-seconds-csv>");
  process.exit(2);
}
const holds = holdsArg.split(",").map(Number);
if (holds.some((h) => !Number.isFinite(h))) {
  console.error(`bad holds: ${holdsArg}`);
  process.exit(2);
}

const W = 1080;
const H = 1920;
const FPS = 30;
// The strip the copy sits in — the same window scripts/measure-grounds.mjs uses
// on the plates, so a plate measurement and a render measurement are comparable.
const TOP = 700;
const BOTTOM = 1220;
const LEFT = 140;
const RIGHT = 940;

const frames = [];
await new Promise((resolve, reject) => {
  const ff = spawn("ffmpeg", ["-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "gray", "-"]);
  const bytes = W * H;
  let held = Buffer.alloc(0);
  ff.stdout.on("data", (chunk) => {
    held = held.length ? Buffer.concat([held, chunk]) : chunk;
    while (held.length >= bytes) {
      const f = held.subarray(0, bytes);
      let strip = 0;
      let n = 0;
      for (let y = TOP; y < BOTTOM; y++) {
        for (let x = LEFT; x < RIGHT; x++) {
          strip += f[y * W + x];
          n++;
        }
      }
      let whole = 0;
      for (let i = 0; i < bytes; i++) whole += f[i];
      frames.push({ strip: strip / n, whole: whole / bytes });
      held = held.subarray(bytes);
    }
  });
  ff.on("error", reject);
  ff.on("close", (c) => (c === 0 ? resolve() : reject(new Error(`ffmpeg exited ${c}`))));
});

let at = 0;
const rows = holds.map((h, i) => {
  const start = at;
  const len = Math.round(h * FPS);
  at += len;
  const mid = start + Math.floor(len / 2);
  return { i, frame: mid, ...frames[mid] };
});

if (at !== frames.length) {
  console.error(`⚠️  holds sum to ${at} frames, video has ${frames.length} — the list is stale`);
}

console.log(`${path} — ${frames.length} frames, holds ${holds.join(", ")}s\n`);
console.log("scene  frame   copy-strip   whole-frame   step");
let inverted = false;
rows.forEach((r, i) => {
  const step = i === 0 ? null : r.strip - rows[i - 1].strip;
  if (i > 0 && i < rows.length - 1 && step > 0) inverted = true;
  console.log(
    `  ${r.i + 1}    ${String(r.frame).padStart(4)}   ${r.strip.toFixed(1).padStart(9)}   ` +
      `${r.whole.toFixed(1).padStart(10)}   ${step === null ? "" : (step > 0 ? "+" : "") + step.toFixed(1)}`,
  );
});

const span = Math.max(...rows.map((r) => r.strip)) - Math.min(...rows.map((r) => r.strip));
console.log(`\nspan ${span.toFixed(1)} luma`);
// ⭐ The failure this exists to name: V58's first render put scene 3 ABOVE
//   scene 2, so the descent reversed in the middle and the arc read as one even
//   dim video. A lift on the FINAL scene is the designed ending, not an
//   inversion, so it is excluded.
console.log(inverted ? "FAIL  the descent inverts mid-cut" : "PASS  the descent holds to the last scene");
process.exit(inverted ? 1 : 0);
