#!/usr/bin/env node
/**
 * npm run sync:daily-energy
 *
 * Refreshes content/daily-energy.json from https://numevix.com/tarot/feed.json.
 *
 * The snapshot is COMMITTED deliberately. The day's energy depends only on the
 * weekday, and one feed fetch contains all seven, so the pipeline never needs
 * the network to produce a video and the content it will use is visible in git
 * before a run. Staleness is bounded and visible: the snapshot is only wrong if
 * the numerology dataset itself changed, and `git diff` shows exactly when.
 *
 * Exits ZERO even when the feed is unreachable, as long as a snapshot already
 * exists. A network blip must never cost a day's batch.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { reduceFeedToWeekdays } from "./lib/daily-energy.mjs";

/** Overridable so the sync can be pointed at a preview deploy, or exercised
 *  against an unreachable host to prove the fallback below actually holds. */
const FEED_URL = process.env.DAILY_ENERGY_FEED_URL ?? "https://numevix.com/tarot/feed.json";
const SNAPSHOT_PATH = "content/daily-energy.json";

const log = (...a) => process.stdout.write(a.join(" ") + "\n");

const keepExisting = (reason) => {
  if (existsSync(SNAPSHOT_PATH)) {
    log(`sync:daily-energy — ${reason}. Keeping the existing snapshot.`);
    process.exit(0);
  }
  // No snapshot and no network: the pipeline handles this by failing that one
  // video with a clear message and still producing the other two. Still exit
  // zero -- this script's failure must not abort the batch either.
  log(`sync:daily-energy — ${reason}, and no snapshot exists yet.`);
  log("The daily-energy video will be skipped; the day's other videos are unaffected.");
  process.exit(0);
};

let payload;
try {
  const res = await fetch(FEED_URL);
  if (!res.ok) keepExisting(`feed returned HTTP ${res.status}`);
  payload = await res.json();
} catch (err) {
  keepExisting(`feed unreachable (${String(err?.message ?? err)})`);
}

let byWeekday;
try {
  byWeekday = reduceFeedToWeekdays(payload.items ?? []);
} catch (err) {
  // A feed that parsed but is missing _numevix is treated as unreachable, not
  // as half-built. Composing a video from empty props would ship a blank
  // overlay, which is worse than shipping nothing.
  keepExisting(`feed is not usable (${String(err?.message ?? err)})`);
}

const next = JSON.stringify(
  { source: FEED_URL, syncedAt: new Date().toISOString().slice(0, 10), weekdays: byWeekday },
  null,
  2,
);

const previous = existsSync(SNAPSHOT_PATH) ? readFileSync(SNAPSHOT_PATH, "utf8") : null;
const contentChanged =
  previous === null ||
  JSON.stringify(JSON.parse(previous).weekdays) !== JSON.stringify(byWeekday);

if (!contentChanged) {
  // Rewriting only to bump syncedAt would produce a daily no-op commit and
  // bury the one diff that matters -- the dataset actually changing.
  log("sync:daily-energy — snapshot already current, nothing written.");
  process.exit(0);
}

writeFileSync(SNAPSHOT_PATH, next + "\n");
log(`sync:daily-energy — wrote ${SNAPSHOT_PATH} (${Object.keys(byWeekday).length} weekdays).`);
