#!/usr/bin/env node
/**
 * npm run music:beatmaps — regenerates content/beat-maps.json.
 *
 * One entry per bed: the times (ms from file zero) of every beat actually
 * tracked in the audio, plus the interval spread that says how much to trust
 * them. The daily pipeline snaps its cuts to these.
 *
 * Committed rather than computed at render time: it takes a few seconds per
 * track, it must not change between a dry run and the real run, and a bed's
 * beats are a property of the file, which does not change.
 */
import { writeFileSync } from "node:fs";
import { beatMap, beatMapQuality } from "./lib/tempo.mjs";
import { BEDS } from "./lib/music-pool.mjs";

/** Above this the tracker is not following the pulse; see beatMapQuality. */
const SD_LIMIT_MS = 15;

const out = {};
console.log("bed                beats     bpm   sd(ms)   usable");
for (const [key, bed] of Object.entries(BEDS)) {
  const beats = beatMap(`public/music/${bed.file}`, { targetBpm: bed.bpm });
  const q = beatMapQuality(beats);
  const usable = q.intervalSdMs !== null && q.intervalSdMs <= SD_LIMIT_MS;
  out[key] = {
    bpm: q.bpm,
    intervalSdMs: q.intervalSdMs,
    usable,
    beatsMs: beats.map((t) => Math.round(t * 1000)),
  };
  console.log(
    `${key.padEnd(18)}${String(q.beats).padStart(5)}${String(q.bpm).padStart(8)}` +
      `${String(q.intervalSdMs).padStart(9)}   ${usable ? "yes" : "NO — cuts fall back to even timing"}`,
  );
}

writeFileSync("content/beat-maps.json", JSON.stringify(out, null, 2) + "\n");
console.log(`\nwrote content/beat-maps.json (${Object.keys(out).length} beds)`);
