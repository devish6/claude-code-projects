#!/usr/bin/env node
/**
 * npm run qa:frame -- <path-to-mp4>
 *
 * Extracts frame 0 as raw greyscale and judges it. Exits non-zero on failure
 * so it can gate a render.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { frameStats, judgeFirstFrame } from "./lib/qa-frame.mjs";

const run = promisify(execFile);
const path = process.argv[2];
if (!path) {
  console.error("usage: npm run qa:frame -- <path-to-mp4>");
  process.exit(2);
}

// -vframes 1 on the first frame, greyscale, straight to stdout. maxBuffer is
// raised because a 1080x1920 grey frame is ~2MB and the default is 1MB.
const { stdout } = await run(
  "ffmpeg",
  ["-v", "error", "-i", path, "-vframes", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
  { encoding: "buffer", maxBuffer: 32 * 1024 * 1024 },
);

const gate = judgeFirstFrame(frameStats(new Uint8Array(stdout)));
console.log(`${gate.pass ? "PASS" : "FAIL"}  ${gate.name} — ${gate.detail}`);
process.exit(gate.pass ? 0 : 1);
