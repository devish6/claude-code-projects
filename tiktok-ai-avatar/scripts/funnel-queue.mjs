#!/usr/bin/env node
/**
 * npm run funnel:queue -- [--media=<mediaId>]
 *
 * Builds the hand-fulfilment queue: who commented, what to reply publicly, and
 * what to send in the DM. Sends NOTHING — the owner does that by hand until
 * Meta App Review lands.
 *
 * 🔴 Every number in the DM is DERIVED from content/compatibility-reel.json,
 * which scripts/derive-compatibility-pairs.mjs re-checks against
 * vedic-numerology/lib/numerology/friendship.ts and exits non-zero on drift.
 * Run that script before trusting this output.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildQueue } from "./lib/funnel.mjs";

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? null;

const reelPath = join(process.cwd(), "content", "compatibility-reel.json");
if (!existsSync(reelPath)) {
  console.error(`No ${reelPath}. Run: node scripts/derive-compatibility-pairs.mjs`);
  process.exit(1);
}
const pairs = JSON.parse(readFileSync(reelPath, "utf8")).pairs ?? [];

// Comments arrive from the Windsor `comments` table. In a Claude Code session,
// pull them with the Windsor MCP (get_fields first, then get_data on
// comment_id, comment_text, comment_timestamp, media_id) and pipe the JSON in.
const stdin = readFileSync(0, "utf8").trim();
if (!stdin) {
  console.error(
    "Pipe Windsor comment rows in as JSON:\n" +
      "  npm run funnel:queue < comments.json\n" +
      "Fields: comment_id, comment_text, comment_timestamp, media_id",
  );
  process.exit(1);
}

const all = JSON.parse(stdin);
const media = arg("media");
const comments = media ? all.filter((c) => String(c.media_id) === media) : all;
const queue = buildQueue(comments, pairs);

console.log(`\n${comments.length} comments · ${queue.length} actionable · ${comments.length - queue.length} correctly ignored\n`);
for (const row of queue) {
  console.log(`— ${row.username ?? row.commentId} (moolank ${row.moolank})`);
  console.log(`  reply: ${row.reply}`);
  console.log(`  DM:    ${row.dm}\n`);
}
