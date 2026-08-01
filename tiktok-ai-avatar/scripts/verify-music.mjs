/**
 * Measures every registered bed and prints the table that TRACK_BPM /
 * TRACK_PHASE_MS should hold. Run after adding music: `npm run music:verify`.
 *
 * ⭐⭐ IT MEASURES A SYNTHETIC CLICK TRACK FIRST, AND EXITS NON-ZERO IF THAT
 * READING IS WRONG. This is the standing positive-control rule, and here it
 * earned its keep twice over:
 *
 * 1. The first implementation "passed" against every real bed while being 1.8%
 *    wrong at 150 BPM — invisible without a known answer to check against.
 * 2. The project notes named `voltslope-v08.mp3` as ground truth, "150.00 by
 *    construction". Once the tool was validated on clicks it read that file at
 *    152.2. The note was wrong: the 143.6 BPM estimate the `atempo` correction
 *    was derived from was itself off, so stretching by 150/143.6 landed
 *    somewhere else entirely. **A file is not ground truth because a previous
 *    session asserted it; only a signal you construct is.**
 */
import { measureTempo, openingRatio } from "./lib/tempo.mjs";
import { BEDS } from "./lib/music-pool.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const SR = 44100;
const clickTrack = (bpm, secs = 30) => {
  const n = SR * secs;
  const x = new Float32Array(n);
  const period = 60 / bpm;
  for (let b = 0; b * period < secs; b++) {
    const start = Math.floor(b * period * SR);
    for (let i = 0; i < Math.floor(0.05 * SR) && start + i < n; i++) {
      const env = Math.exp(-i / (0.008 * SR));
      x[start + i] += env * (0.6 * Math.sin((2 * Math.PI * 80 * i) / SR) + 0.4 * (Math.random() * 2 - 1));
    }
  }
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, x[i] * 20000)), 44 + i * 2);
  const p = join(tmpdir(), `numevix-click-${bpm}.wav`);
  writeFileSync(p, buf);
  return p;
};

let failed = false;

console.log("POSITIVE CONTROL — synthetic clicks at tempos set in this file");
for (const bpm of [128, 139.7, 150, 165]) {
  const r = measureTempo(clickTrack(bpm), { targetBpm: bpm });
  const err = ((r.bpm - bpm) / bpm) * 100;
  const ok = Math.abs(err) < 0.1;
  if (!ok) failed = true;
  console.log(`  ${ok ? "ok  " : "FAIL"} true ${String(bpm).padStart(6)} -> ${r.bpm.toFixed(3).padStart(8)}  (${err.toFixed(3)}%)`);
}
if (failed) {
  console.error("\n! The measurement itself is wrong. Every number below is meaningless.");
  process.exit(1);
}

console.log("\nREGISTERED BEDS");
console.log("  bed                measured   phase   resid  open   frames/beat");
for (const [key, bed] of Object.entries(BEDS)) {
  const path = `public/music/${bed.file}`;
  const r = measureTempo(path, { targetBpm: bed.bpm });
  const open = openingRatio(path);
  const warn = [];
  if (r.residualMs > 30) warn.push("unsteady pulse");
  if (open < 0.5) warn.push("fades in");
  if (Math.abs(r.bpm - bed.bpm) / bed.bpm > 0.005) warn.push(`registered ${bed.bpm}`);
  console.log(
    `  ${key.padEnd(18)}${r.bpm.toFixed(2).padStart(8)}${String(r.phaseMs + "ms").padStart(8)}` +
    `${String(r.residualMs + "ms").padStart(8)}${open.toFixed(2).padStart(6)}` +
    `${((60 / r.bpm) * 30).toFixed(3).padStart(13)}   ${warn.join(", ")}`,
  );
}
