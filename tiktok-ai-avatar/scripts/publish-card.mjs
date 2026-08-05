#!/usr/bin/env node
/**
 * npm run publish:card -- --n=8 [--dry-run] [--force] [--keep-hosted]
 *
 * Publishes a Moolank info-card to Instagram as a FEED IMAGE.
 *
 * ⭐ WHY THIS IS A SEPARATE SCRIPT FROM publish-instagram.mjs
 * That one posts REELS: it reads a video entry out of daily-state.json, probes
 * the mp4 with ffprobe, and sends `media_type: "REELS"` with a `video_url`. A
 * card shares none of that — no ledger entry, no duration, no cover, and a
 * different container shape (`image_url`, no media_type). Bending the Reels
 * path around an image would have meant a branch in every one of those steps.
 *
 * What it DOES share is the staging trick: Instagram fetches the file from a
 * public URL rather than accepting an upload, so the jpeg is parked on a GitHub
 * release for the minute Instagram needs it, then deleted in a `finally`.
 *
 * 🔴 Credentials live in ~/.numevix-publish/credentials.json at 0600, never in
 * this repo — it is public and Pages-served.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadCredentials } from "./lib/credentials.mjs";
import { hostAsset, unhostVideo } from "./lib/media-host.mjs";
import { buildCardCaption, validateCardImage } from "./lib/cards.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

const GRAPH = "https://graph.facebook.com/v21.0";
const POST_LOG = join(homedir(), ".numevix-publish", "card-posts.json");

const log = (...a) => process.stdout.write(a.join(" ") + "\n");
const die = (msg) => {
  process.stderr.write(msg + "\n");
  process.exit(1);
};

const graph = async (path, params = {}, method = "GET") => {
  const url = new URL(`${GRAPH}${path}`);
  if (method === "GET") for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, {
    method,
    ...(method === "POST"
      ? {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(params),
        }
      : {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path} → ${res.status} ${JSON.stringify(json)}`);
  return json;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Dimensions of a still, via ffprobe — the same tool the Reels path uses. */
const probeImage = (file) => {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
     "-of", "json", file],
    { encoding: "utf8" },
  );
  const s = JSON.parse(out).streams[0];
  return { width: s.width, height: s.height };
};

const main = async () => {
  const n = Number(flag("n"));
  if (!Number.isInteger(n) || n < 1 || n > 9) die("Pass --n=8 to choose which Moolank card to post.");

  const cards = JSON.parse(readFileSync(join(ROOT, "content/moolank-cards.json"), "utf8"));
  const card = cards[n];
  if (!card) die(`No card data for Moolank ${n}.`);

  const file = join(ROOT, "out/cards", `moolank-${n}.jpg`);
  if (!existsSync(file)) die(`No rendered jpeg at ${file}. Run: npm run cards -- ${n} --jpg`);

  const dims = probeImage(file);
  try {
    validateCardImage({ ...dims, path: file });
  } catch (err) {
    die(`Card ${n} is not a valid Instagram feed image: ${err.message}`);
  }

  const caption = buildCardCaption(card);

  // Posting the same card twice is a real risk once this is scheduled, and
  // Instagram will happily accept the duplicate.
  const posted = existsSync(POST_LOG) ? JSON.parse(readFileSync(POST_LOG, "utf8")) : [];
  const seen = posted.find((p) => p.moolank === n);
  if (seen && !has("force") && !has("dry-run")) {
    die(
      `Moolank ${n} was already posted on ${seen.date} (media ${seen.mediaId}).\n` +
        "Re-running would post a duplicate. Pass --force only if that is genuinely wanted.",
    );
  }

  const c = loadCredentials()?.instagram;
  if (!c?.ig_user_id) die("No Instagram credentials. Run: npm run publish:instagram -- --authorize");

  log(`\nMoolank ${n} — ${card.archetype}`);
  log(`  file:  out/cards/moolank-${n}.jpg (${dims.width}x${dims.height})`);
  log(`  to:    instagram ${c.ig_user_id} via page ${c.page_name}`);

  if (has("dry-run")) {
    log("\n[DRY RUN] Nothing hosted, nothing posted. Caption would be:\n");
    log("─".repeat(64));
    log(caption);
    log("─".repeat(64));
    return;
  }

  log("\nStaging the image so Instagram can fetch it…");
  const hosted = hostAsset({ v: `CARD-${n}` }, file, `moolank-${n}.jpg`);
  log(`  ${hosted.url}`);

  try {
    log("Creating the media container…");
    // No media_type: the Graph API defaults a container with image_url to IMAGE.
    // Passing media_type: "IMAGE" is also accepted but is not what the docs use
    // for single-image feed posts, and REELS here would be rejected outright.
    const container = await graph(`/${c.ig_user_id}/media`, {
      image_url: hosted.url,
      caption,
      access_token: c.page_token,
    }, "POST");

    // Images skip transcoding, so this usually finishes on the first poll —
    // but an unreachable URL also surfaces here, so it is still worth checking.
    log("Waiting for Instagram to accept it…");
    let ok = false;
    for (let i = 0; i < 12; i++) {
      await sleep(3000);
      const status = await graph(`/${container.id}`, {
        fields: "status_code,status",
        access_token: c.page_token,
      });
      if (status.status_code === "FINISHED") { ok = true; break; }
      if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
        die(`Instagram rejected the image: ${status.status ?? status.status_code}`);
      }
      process.stdout.write(".");
    }
    process.stdout.write("\n");
    if (!ok) die("Instagram never finished processing the image.");

    log("Publishing…");
    const published = await graph(`/${c.ig_user_id}/media_publish`, {
      creation_id: container.id,
      access_token: c.page_token,
    }, "POST");

    posted.push({
      date: new Date().toISOString().slice(0, 10),
      moolank: n,
      mediaId: published.id,
    });
    mkdirSync(join(homedir(), ".numevix-publish"), { recursive: true });
    writeFileSync(POST_LOG, JSON.stringify(posted, null, 2) + "\n");

    log(`\n✅ Posted Moolank ${n} to Instagram — media ${published.id}`);
  } finally {
    // Always remove the staged copy, even on failure — it is a public download
    // link on a public repo and has no reason to outlive the post.
    if (!has("keep-hosted")) {
      log(unhostVideo(hosted) ? "Removed the staged copy." : "⚠️  Could not remove the staged copy — delete the release manually.");
    }
  }
};

await main();
