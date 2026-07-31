#!/usr/bin/env node
/**
 * npm run publish:next -- [--dry-run] [--platforms=youtube,instagram,facebook]
 *
 * Publishes the OLDEST rendered-but-unpublished video to every platform that
 * can be automated, then stops. Run twice a day and the day's two videos go
 * out at the two times you chose.
 *
 * ⭐ WHY OUR OWN SCHEDULER RATHER THAN THE PLATFORMS'.
 * Instagram's Content Publishing API cannot schedule Reels at all — there is
 * no scheduled_publish_time and it rejects future timestamps, so something on
 * our side has to wake up and fire the publish regardless. YouTube and
 * Facebook DO have native scheduling, but using it would mean three code paths
 * and three failure modes for one outcome, while still needing this job for
 * Instagram. One waking scheduler covers all three, uniformly.
 *
 * ⭐ WHY "OLDEST UNPUBLISHED" RATHER THAN "TODAY'S".
 * Renders and posts are decoupled on purpose. A render can fail, a laptop can
 * sleep through 18:00, and a backlog already exists. Draining oldest-first
 * means a missed day self-heals instead of silently skipping a video forever.
 *
 * 🔴 TikTok is deliberately NOT included. Its API path is drafts-only by
 * design — a human taps publish in the app, which is the human checkpoint the
 * account is rebuilding behind. Pass --platforms to override.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const PLATFORMS = (args.find((a) => a.startsWith("--platforms="))?.split("=")[1] ?? "youtube,instagram,facebook")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const DIR = join(homedir(), ".numevix-publish");
const log = (...a) => console.log(...a);
const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback);

const state = readJson("content/daily-state.json", { videos: [] });

/**
 * Already published on THIS platform. Each publisher keeps its own ledger, so
 * a video half-posted (YouTube ok, Instagram failed) is retried only where it
 * failed rather than double-posting where it succeeded.
 */
const publishedOn = (platform, v) => {
  const ledger = readJson(join(DIR, `${platform}-uploads.json`), []);
  return ledger.some((row) => row.v === v);
};

// Candidates: rendered, not a seed row, oldest first. `generated` is the
// status the pipeline writes once a render has actually produced a file.
const candidates = (state.videos ?? [])
  .filter((v) => v.status === "generated" && v.source !== "seed-existing")
  .sort((a, b) => (a.date === b.date ? a.v.localeCompare(b.v) : a.date.localeCompare(b.date)));

const unpublished = (v) => PLATFORMS.some((p) => !publishedOn(p, v.v));

/**
 * TODAY'S videos come first, and that ordering is load-bearing.
 *
 * The weekday series is a promise — Moolank Monday has to land on a Monday.
 * Strict oldest-first would drain a week-old backlog into today's slot and
 * post Monday's video on a Thursday, which quietly destroys the one thing the
 * series exists to create. Backlog is still drained, but only in slots that
 * today's content does not need, so nothing is stranded either.
 */
const today = new Date().toISOString().slice(0, 10);
const todays = candidates.filter((v) => v.date === today && unpublished(v));
const backlog = candidates.filter((v) => v.date !== today && unpublished(v));
const next = todays[0] ?? backlog[0];
if (next && next.date !== today) {
  log(`(nothing left for ${today} — draining backlog instead)`);
}

if (!next) {
  log("Nothing to publish — every rendered video is already out on every platform.");
  process.exit(0);
}

const pending = PLATFORMS.filter((p) => !publishedOn(p, next.v));
log(`Next up: ${next.v} — ${next.title}  (${next.date})`);
log(`  pending on: ${pending.join(", ")}`);

if (DRY_RUN) {
  log("\n[DRY RUN] Nothing published.");
  process.exit(0);
}

let failed = 0;
for (const platform of pending) {
  log(`\n── ${platform} ──`);
  try {
    // Each publisher already owns its own auth, retries, duplicate guard and
    // ledger. This script sequences them; it does not reimplement any of it.
    execFileSync("node", [`scripts/publish-${platform}.mjs`, `--v=${next.v}`, ...(platform === "youtube" ? ["--privacy=public"] : [])], {
      stdio: "inherit",
    });
  } catch {
    // One platform failing must not stop the others — a video on two networks
    // beats a video on none, and the ledger means the failed one retries on
    // the next wake rather than being lost.
    failed++;
    log(`  ! ${platform} failed — it will be retried on the next run.`);
  }
}

log(
  failed
    ? `\nDone with ${failed} failure(s). ${next.v} stays queued for those platforms.`
    : `\n✅ ${next.v} is out on ${pending.join(", ")}.`,
);
process.exit(failed ? 1 : 0);
