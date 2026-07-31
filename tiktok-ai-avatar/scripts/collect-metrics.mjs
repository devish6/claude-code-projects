#!/usr/bin/env node
/**
 * npm run collect:metrics -- [--dry-run]
 *
 * Pulls performance data for everything we have published and appends it to
 * ~/.numevix-publish/metrics.json as a dated sample. Read-only against every
 * platform; it publishes nothing.
 *
 * ⭐ WHY THIS EXISTS: the whole optimisation loop — which hook won, which
 * length held attention, which CTA earned comments — consumes performance
 * data, and until now nothing anywhere read a single metric back. The upload
 * ledgers record what we POSTED, never how it DID.
 *
 * ⭐ RUN IT DAILY. Platforms report a running total, so the growth curve only
 * exists if we sample repeatedly. A total collected once is unrecoverable
 * later — you cannot ask YouTube what a video's views were last Tuesday.
 *
 * 🔴 WHAT THIS CANNOT SEE YET, and why (each verified by a real 403, not
 * assumed):
 *   - YouTube views/likes/comments → `videos.list` returns 403 on the
 *     `youtube.upload` scope we hold. Upload is WRITE-ONLY; reading back needs
 *     `youtube.readonly`. (Corrected 2026-07-31 — an earlier note here claimed
 *     the upload scope sufficed. It does not.)
 *   - watch time / average view duration / completion → a different API again,
 *     `yt-analytics.readonly`.
 *   - Instagram reach/saves/shares → needs `instagram_manage_insights`.
 *   - Facebook video insights      → needs `read_insights`.
 *
 * Instagram likes/comments and Facebook views DO work on the scopes already
 * held, so collection starts today for two platforms out of three rather than
 * waiting on any re-authorization.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { appendSamples, latestPerVideo, rankByVelocity } from "./lib/metrics.mjs";

const DIR = join(homedir(), ".numevix-publish");
const STORE = join(DIR, "metrics.json");
const CREDS = join(DIR, "credentials.json");
const DRY_RUN = process.argv.includes("--dry-run");
const log = (...a) => console.log(...a);

const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback);

const creds = readJson(CREDS, null);
if (!creds) {
  console.error(`No credentials at ${CREDS}. Nothing to collect.`);
  process.exit(1);
}

const collectedAt = new Date().toISOString();
const samples = [];
const blocked = [];

// ── YouTube ────────────────────────────────────────────────────────────────
// videos.list?part=statistics is a READ, and the `youtube.upload` scope does
// NOT grant it — upload is write-only. Confirmed by a real 403 rather than
// inferred. Detected below and reported as an action, not as a crash, so the
// other two platforms still collect.
const collectYouTube = async () => {
  const ledger = readJson(join(DIR, "youtube-uploads.json"), []);
  if (!ledger.length) return;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.youtube.client_id,
      client_secret: creds.youtube.client_secret,
      refresh_token: creds.youtube.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const tok = await res.json();
  if (!tok.access_token) {
    log("  youtube: could not refresh the token — skipped");
    return;
  }

  const ids = ledger.map((r) => r.videoId).join(",");
  const r = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}`,
    { headers: { Authorization: `Bearer ${tok.access_token}` } },
  );
  const body = await r.json();
  if (r.status === 403) {
    // The specific, actionable case — not a mystery failure.
    blocked.push(
      "youtube: views/likes/comments — add the `youtube.readonly` scope and re-run\n" +
        "      `npm run publish:youtube -- --authorize`. The upload scope cannot read.",
    );
    log("  youtube: 403 — upload scope cannot read stats (see the note at the end)");
    return;
  }
  if (!r.ok) {
    log(`  youtube: ${r.status} ${JSON.stringify(body).slice(0, 140)}`);
    return;
  }
  const byId = new Map((body.items ?? []).map((i) => [i.id, i.statistics]));
  for (const row of ledger) {
    const st = byId.get(row.videoId);
    if (!st) continue;
    samples.push({
      v: row.v,
      platform: "youtube",
      videoId: row.videoId,
      collectedAt,
      views: Number(st.viewCount ?? 0),
      likes: Number(st.likeCount ?? 0),
      comments: Number(st.commentCount ?? 0),
    });
  }
  blocked.push("youtube: watch time + average view duration (needs yt-analytics.readonly)");
};

// ── Instagram ──────────────────────────────────────────────────────────────
// instagram_basic exposes like_count and comments_count on a media object.
// Reach, saves and shares are Insights and need instagram_manage_insights.
const collectInstagram = async () => {
  const ledger = readJson(join(DIR, "instagram-uploads.json"), []);
  if (!ledger.length) return;
  const token = creds.instagram.page_token;
  for (const row of ledger) {
    const id = row.mediaId ?? row.videoId ?? row.id;
    if (!id) continue;
    const r = await fetch(
      `https://graph.facebook.com/v21.0/${id}?fields=like_count,comments_count&access_token=${token}`,
    );
    const body = await r.json();
    if (!r.ok) {
      log(`  instagram ${row.v}: ${r.status} ${JSON.stringify(body.error?.message ?? body).slice(0, 120)}`);
      continue;
    }
    samples.push({
      v: row.v,
      platform: "instagram",
      videoId: String(id),
      collectedAt,
      views: null, // plays/reach are Insights — see blocked list
      likes: Number(body.like_count ?? 0),
      comments: Number(body.comments_count ?? 0),
    });
  }
  blocked.push("instagram: plays, reach, saves, shares (needs instagram_manage_insights)");
};

// ── Facebook ───────────────────────────────────────────────────────────────
const collectFacebook = async () => {
  const ledger = readJson(join(DIR, "facebook-uploads.json"), []);
  if (!ledger.length) return;
  const token = creds.instagram.page_token; // one Meta app serves both
  for (const row of ledger) {
    const id = row.videoId ?? row.id;
    if (!id) continue;
    const r = await fetch(
      `https://graph.facebook.com/v21.0/${id}?fields=views,likes.summary(true),comments.summary(true)&access_token=${token}`,
    );
    const body = await r.json();
    if (!r.ok) {
      log(`  facebook ${row.v}: ${r.status} ${JSON.stringify(body.error?.message ?? body).slice(0, 120)}`);
      continue;
    }
    samples.push({
      v: row.v,
      platform: "facebook",
      videoId: String(id),
      collectedAt,
      views: body.views ?? null,
      likes: body.likes?.summary?.total_count ?? 0,
      comments: body.comments?.summary?.total_count ?? 0,
    });
  }
  blocked.push("facebook: watch time, retention curve (needs read_insights)");
};

log(`Collecting at ${collectedAt}`);
await collectYouTube();
await collectInstagram();
await collectFacebook();

if (!samples.length) {
  log("\nNothing collected. Publish something first.");
  process.exit(0);
}

log("\nThis run:");
for (const s of samples) {
  log(
    `  ${s.platform.padEnd(10)} ${s.v.padEnd(5)} views=${s.views ?? "—"} likes=${s.likes} comments=${s.comments}`,
  );
}

const existing = readJson(STORE, []);
const merged = appendSamples(existing, samples);

if (DRY_RUN) {
  log(`\n[DRY RUN] Would store ${merged.length - existing.length} new sample(s). Nothing written.`);
} else {
  writeFileSync(STORE, JSON.stringify(merged, null, 2));
  log(`\nStored ${merged.length - existing.length} new sample(s) → ${STORE}`);
}

const ranked = rankByVelocity(merged);
if (ranked.length) {
  log("\nFastest by views/hour since first measured:");
  for (const r of ranked.slice(0, 5)) {
    log(`  ${r.platform.padEnd(10)} ${r.v.padEnd(5)} ${r.viewsPerHour}/h  (+${r.views} over ${r.hours}h)`);
  }
} else {
  log(
    `\nNo velocity yet — ${latestPerVideo(merged).length} video(s) measured once. ` +
      "Run this again tomorrow and the growth curve starts.",
  );
}

if (blocked.length) {
  log("\nNot collected, each needing one re-authorization:");
  for (const b of blocked) log(`  • ${b}`);
}
