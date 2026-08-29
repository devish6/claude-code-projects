#!/usr/bin/env node
/**
 * npm run qa:frame -- <path-to-mp4>
 *
 * Scans EVERY frame as raw greyscale and judges it. Exits non-zero on failure
 * so it can gate a render.
 */
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

import { frameStats, judgeEveryFrame, judgeFirstFrame } from "./lib/qa-frame.mjs";

const run = promisify(execFile);
const path = process.argv[2];
if (!path) {
  console.error("usage: npm run qa:frame -- <path-to-mp4>");
  process.exit(2);
}

const probe = async (args) =>
  (
    await run("ffprobe", ["-v", "error", ...args, path], { encoding: "utf8", maxBuffer: 1024 * 1024 })
  ).stdout.trim();

const [w, h] = (
  await probe(["-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x"])
).split("x").map(Number);

// The whole video as raw greyscale, streamed. A 1080x1920 grey frame is ~2MB,
// so a 12s cut is ~760MB — it is read frame by frame and never buffered whole.
// 🪤 `-ss` would have to come AFTER `-i` to be accurate; there is no seek here
// on purpose, because a sampled frame is not a scan.
const bytes = w * h;
const frames = [];
await new Promise((resolve, reject) => {
  const ff = spawn("ffmpeg", ["-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "gray", "-"]);
  let held = Buffer.alloc(0);
  ff.stdout.on("data", (chunk) => {
    held = held.length ? Buffer.concat([held, chunk]) : chunk;
    while (held.length >= bytes) {
      frames.push(frameStats(new Uint8Array(held.subarray(0, bytes))));
      held = held.subarray(bytes);
    }
  });
  ff.on("error", reject);
  ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
});

// 🪤 TWO GATES, NOT ONE. `judgeFirstFrame` is absolute and calibrated on the
// light format; `judgeEveryFrame` is relative and self-calibrates to whatever
// it is handed. Neither subsumes the other — frame 0 can be legible while
// frame 56 is black, which is exactly what shipped six times.
const gates = [judgeFirstFrame(frames[0] ?? { mean: 0, stddev: 0 }), judgeEveryFrame(frames)];
for (const gate of gates) console.log(`${gate.pass ? "PASS" : "FAIL"}  ${gate.name} — ${gate.detail}`);
process.exit(gates.every((g) => g.pass) ? 0 : 1);
