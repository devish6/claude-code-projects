#!/usr/bin/env node
/**
 * npm run backfill:durations -- [--dry-run]
 *
 * Fills durations.json from every rendered MP4 still on disk. One-shot, but
 * safe to re-run: mergeDurations never erases a reading with a failure.
 *
 * 🪤 Expect this to MISS most of history, and that is the finding, not a bug.
 * The publishing ledgers start 2026-07-31 and the mid-July winners were
 * rendered by the earlier `out/` batches before the V-series existed. Print
 * the miss count loudly — it is the number that says how much of the past is
 * permanently unmeasurable.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { loadDurations, mergeDurations, probeDuration } from "./lib/duration.mjs";
import { loadState } from "./lib/state.mjs";
import { writeFileSync } from "node:fs";

const DRY_RUN = process.argv.includes("--dry-run");
const DIR = join(homedir(), ".numevix-publish");
const VIDEO_ROOT = join(homedir(), "Desktop", "Numevix Videos", "Viral");

/** Every place a render has ever been written, newest convention first. */
const candidatePaths = (entry) => {
  const paths = [];
  if (entry.file) paths.push(join(process.cwd(), entry.file));
  if (existsSync(VIDEO_ROOT)) {
    for (const folder of readdirSync(VIDEO_ROOT)) {
      if (!folder.startsWith(`${entry.v} - `)) continue;
      const full = join(VIDEO_ROOT, folder);
      if (!statSync(full).isDirectory()) continue;
      for (const f of readdirSync(full)) {
        if (f.endsWith(".mp4")) paths.push(join(full, f));
      }
    }
  }
  return paths;
};

const state = loadState();
const found = {};
const missing = [];

for (const entry of state.videos ?? []) {
  let seconds = null;
  for (const p of candidatePaths(entry)) {
    seconds = await probeDuration(p);
    if (seconds !== null) break;
  }
  if (seconds === null) missing.push(entry.v);
  else found[entry.v] = seconds;
}

const merged = mergeDurations(loadDurations(DIR), found);
console.log(`measured ${Object.keys(found).length}, unmeasurable ${missing.length}`);
if (missing.length) console.log(`  no surviving render for: ${missing.join(", ")}`);

if (DRY_RUN) console.log("--dry-run: nothing written");
else {
  writeFileSync(join(DIR, "durations.json"), `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`wrote ${Object.keys(merged).length} durations`);
}
