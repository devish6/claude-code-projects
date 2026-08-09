#!/usr/bin/env node
/**
 * npm run analyze:reach -- [--split=YYYY-MM-DD] [--min-reach=1000]
 *
 * The Analyzer's inward read. Prints the account's own baseline, the
 * watch-time buckets, the era split and the winner clusters. Reports
 * measurements; never authors, never scores.
 *
 * 🔴 The API key lives in ~/.numevix-publish/credentials.json under
 * `windsor.api_key`, NEVER in this repo — it is public and Pages-served.
 * ⭐ Prefer the Windsor MCP inside a Claude Code session: it needs no key at
 * all. This script is the durable, unattended path.
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { loadDurations } from "./lib/duration.mjs";
import {
  bucketByWatchTime,
  findWinnerClusters,
  indexByMediaId,
  joinWindsor,
  median,
  splitAt,
} from "./lib/windsor.mjs";

const DIR = join(homedir(), ".numevix-publish");
const arg = (name, fallback) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;

const SPLIT = arg("split", "2026-07-25");
const MIN_REACH = Number(arg("min-reach", "1000"));

const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback);

const creds = readJson(join(DIR, "credentials.json"), null);
const key = creds?.windsor?.api_key;
if (!key) {
  console.error(
    "No windsor.api_key in ~/.numevix-publish/credentials.json.\n" +
      "Get it from onboard.windsor.ai/app/data-preview, or run the analysis\n" +
      "through the Windsor MCP in a Claude Code session, which needs no key.",
  );
  process.exit(1);
}

const FIELDS = [
  "timestamp",
  "media_id",
  "media_type",
  "media_reach",
  "media_reel_avg_watch_time",
  "media_views",
  "media_like_count",
  "media_comments_count",
  "media_saved",
].join(",");

const url = `https://connectors.windsor.ai/instagram?api_key=${key}&date_preset=last_90d&fields=${FIELDS}`;
const res = await fetch(url);
if (!res.ok) {
  // 🪤 An invalid field returns 400 NAMING the offending field — that is the
  // cheapest way to discover the schema, so print the body rather than a code.
  console.error(`Windsor ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const raw = (await res.json()).data ?? [];
const ledger = readJson(join(DIR, "instagram-uploads.json"), []);
const rows = joinWindsor(raw, indexByMediaId(ledger), loadDurations(DIR)).sort(
  (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
);

console.log(`\n${rows.length} posts · ${rows.filter((r) => r.durationSeconds).length} with a known duration`);

console.log("\nWATCH-TIME BUCKETS");
for (const b of bucketByWatchTime(rows)) {
  console.log(`  ${b.label.padEnd(9)} n=${String(b.n).padStart(2)}  median reach ${b.medianReach}  range ${b.minReach}-${b.maxReach}`);
}

const { before, after } = splitAt(rows, SPLIT);
console.log(`\nERA SPLIT at ${SPLIT}`);
for (const [label, set] of [["before", before], ["after", after]]) {
  const over = set.filter((r) => r.reach >= MIN_REACH).length;
  console.log(`  ${label.padEnd(6)} n=${String(set.length).padStart(2)}  median reach ${median(set.map((r) => r.reach))}  over ${MIN_REACH}: ${over}`);
}

console.log(`\nWINNER CLUSTERS (reach >= ${MIN_REACH}, 24h window)`);
const clusters = findWinnerClusters(rows, { minReach: MIN_REACH, windowHours: 24 });
if (!clusters.length) console.log("  none");
for (const c of clusters) {
  console.log(`  ${c.start.slice(0, 10)}  ${c.posts.length} post(s)  reach ${c.posts.map((p) => p.reach).join(", ")}`);
}

// ⭐ The completion column only means something on posts we can measure. Print
// the count alongside it so a thin sample can never be read as a finding.
const withDuration = rows.filter((r) => r.completion !== null);
console.log(`\nSECONDS vs COMPLETION (n=${withDuration.length})`);
for (const r of withDuration) {
  console.log(`  ${(r.v ?? r.mediaId).padEnd(6)} ${String(r.durationSeconds).padStart(6)}s  watch ${String(r.watchSeconds).padStart(5)}s  ${String(Math.round(r.completion * 100)).padStart(3)}%  reach ${r.reach}`);
}
console.log();
