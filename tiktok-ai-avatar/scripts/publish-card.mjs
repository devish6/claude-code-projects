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
import { buildCardCaption, buildReelCaption, validateCardImage, validateReelVideo } from "./lib/cards.mjs";
import { recordDuration } from "./lib/duration.mjs";

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

/** Dimensions (and for video, duration) via ffprobe. */
const probe = (file) => {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
     "-show_entries", "format=duration", "-of", "json", file],
    { encoding: "utf8" },
  );
  const j = JSON.parse(out);
  const s = j.streams[0];
  return { width: s.width, height: s.height, seconds: Number(j.format.duration) };
};

/**
 * Grabs a still from the reel to use as its grid thumbnail.
 *
 * ⭐ Instagram picks its own frame otherwise, and on a video that springs its
 * type in from nothing that is usually a near-empty frame.
 *
 * ⭐⭐ THE COVER IS THE FINISHED INFO CARD, i.e. the reel's LAST beat, not its
 * hook. The 2026-08-05 measurement is the reason: the info card posted as its
 * own feed image reached 20 accounts with ZERO explore distribution, while the
 * reel reached 126 at 91.8% non-followers. The card cannot earn reach on its
 * own, so it rides the reel — and showing it on the grid is what makes a
 * stranger tap, because it visibly promises something worth keeping.
 *
 * 🪤 15s IS TIED TO CardReel.tsx's BEAT SHEET — its card beat runs 13.1s→17.0s.
 * This file is `.mjs` and CANNOT import the `.ts` constant (the mismatch that
 * has already broken this repo three times), so the coupling is by comment
 * only. Retime the beats and this number has to move with them, or the cover
 * silently becomes whatever beat now sits at 15s.
 *
 * 🪤 Do NOT "simplify" this to the standalone card JPEG from render-cards.mjs.
 * That one is 4:5; Instagram would centre-crop it to the reel's 9:16 and cut
 * the remedy off the bottom. This still is already framed for 9:16.
 */
const COVER_AT_SECONDS = 15;

const reelCover = (n, videoPath) => {
  const out = join(ROOT, "out/reels", `moolank-${n}-cover.jpg`);
  execFileSync("ffmpeg", ["-v", "error", "-ss", String(COVER_AT_SECONDS), "-i", videoPath,
    "-frames:v", "1", "-q:v", "3", out, "-y"]);
  return out;
};

const main = async () => {
  const n = Number(flag("n"));
  if (!Number.isInteger(n) || n < 1 || n > 9) die("Pass --n=8 to choose which Moolank card to post.");

  const cards = JSON.parse(readFileSync(join(ROOT, "content/moolank-cards.json"), "utf8"));
  const card = cards[n];
  if (!card) die(`No card data for Moolank ${n}.`);

  // --reel posts the narrated video; without it, the still card.
  const isReel = has("reel");

  const file = isReel
    ? join(ROOT, "out/reels", `moolank-${n}-reel.mp4`)
    : join(ROOT, "out/cards", `moolank-${n}.jpg`);

  if (!existsSync(file)) {
    die(
      isReel
        ? `No rendered reel at ${file}. Render CardReel-${n} first.`
        : `No rendered jpeg at ${file}. Run: npm run cards -- ${n} --jpg`,
    );
  }

  const dims = probe(file);
  try {
    if (isReel) validateReelVideo(dims);
    else validateCardImage({ ...dims, path: file });
  } catch (err) {
    die(`Moolank ${n} is not a valid Instagram ${isReel ? "reel" : "feed image"}: ${err.message}`);
  }

  const caption = isReel ? buildReelCaption(card) : buildCardCaption(card);

  // Posting the same card twice is a real risk once this is scheduled, and
  // Instagram will happily accept the duplicate.
  // The guard is per number AND per kind: the card and the reel for the same
  // Moolank are two legitimate posts, so a card already logged must not block
  // its reel.
  const kind = isReel ? "reel" : "card";
  const posted = existsSync(POST_LOG) ? JSON.parse(readFileSync(POST_LOG, "utf8")) : [];
  const seen = posted.find((p) => p.moolank === n && (p.kind ?? "card") === kind);
  if (seen && !has("force") && !has("dry-run")) {
    die(
      `The Moolank ${n} ${kind} was already posted on ${seen.date} (media ${seen.mediaId}).\n` +
        "Re-running would post a duplicate. Pass --force only if that is genuinely wanted.",
    );
  }

  const c = loadCredentials()?.instagram;
  if (!c?.ig_user_id) die("No Instagram credentials. Run: npm run publish:instagram -- --authorize");

  log(`\nMoolank ${n} — ${card.archetype}  [${kind}]`);
  log(`  file:  ${file.replace(ROOT + "/", "")} (${dims.width}x${dims.height}${isReel ? `, ${dims.seconds.toFixed(2)}s` : ""})`);
  log(`  to:    instagram ${c.ig_user_id} via page ${c.page_name}`);

  if (has("dry-run")) {
    log("\n[DRY RUN] Nothing hosted, nothing posted. Caption would be:\n");
    log("─".repeat(64));
    log(caption);
    log("─".repeat(64));
    return;
  }

  log(`\nStaging the ${isReel ? "video" : "image"} so Instagram can fetch it…`);
  const tag = isReel ? `REEL-${n}` : `CARD-${n}`;
  const assetName = isReel ? `moolank-${n}-reel.mp4` : `moolank-${n}.jpg`;
  const hosted = hostAsset({ v: tag }, file, assetName);
  log(`  ${hosted.url}`);

  // The cover goes on the SAME release tag, so the single unhost call below
  // removes both — a cover left behind on a public repo breaks the tidy-up
  // guarantee just as surely as the video would.
  let coverUrl;
  if (isReel) {
    const cover = reelCover(n, file);
    coverUrl = hostAsset({ v: tag }, cover, `moolank-${n}-cover.jpg`).url;
    log(`  cover: the info card (frame at ${COVER_AT_SECONDS}s)`);
  }

  try {
    log("Creating the media container…");
    // 🔴 The two kinds take DIFFERENT container shapes. A reel needs an explicit
    // media_type REELS with video_url; a single feed image takes image_url and
    // no media_type at all (the API defaults it to IMAGE). Sending REELS with an
    // image_url, or a video with no media_type, is rejected.
    const container = await graph(`/${c.ig_user_id}/media`, {
      ...(isReel
        ? { media_type: "REELS", video_url: hosted.url, ...(coverUrl ? { cover_url: coverUrl } : {}) }
        : { image_url: hosted.url }),
      caption,
      access_token: c.page_token,
    }, "POST");

    // Images skip transcoding, so this usually finishes on the first poll —
    // but an unreachable URL also surfaces here, so it is still worth checking.
    log("Waiting for Instagram to accept it…");
    let ok = false;
    // A video has to be transcoded, an image does not — so the reel needs a much
    // longer ceiling. 60 x 5s covers a 32s reel comfortably; images finish on
    // the first poll.
    const tries = isReel ? 60 : 12;
    for (let i = 0; i < tries; i++) {
      await sleep(isReel ? 5000 : 3000);
      const status = await graph(`/${container.id}`, {
        fields: "status_code,status",
        access_token: c.page_token,
      });
      if (status.status_code === "FINISHED") { ok = true; break; }
      if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
        die(`Instagram rejected the ${kind}: ${status.status ?? status.status_code}`);
      }
      process.stdout.write(".");
    }
    process.stdout.write("\n");
    if (!ok) die(`Instagram never finished processing the ${kind}.`);

    log("Publishing…");
    const published = await graph(`/${c.ig_user_id}/media_publish`, {
      creation_id: container.id,
      access_token: c.page_token,
    }, "POST");

    posted.push({
      date: new Date().toISOString().slice(0, 10),
      moolank: n,
      kind,
      mediaId: published.id,
    });
    mkdirSync(join(homedir(), ".numevix-publish"), { recursive: true });
    writeFileSync(POST_LOG, JSON.stringify(posted, null, 2) + "\n");

    // `M<n>R` is the id this reel carries everywhere else — daily-state.json,
    // the UTM `utm_content`, and the other three publishers' ledgers — so the
    // durations ledger has to key on the same string or the join fails.
    if (isReel) await recordDuration(`M${n}R`, file);

    log(`\n✅ Posted the Moolank ${n} ${kind} to Instagram — media ${published.id}`);
  } finally {
    // Always remove the staged copy, even on failure — it is a public download
    // link on a public repo and has no reason to outlive the post.
    if (!has("keep-hosted")) {
      log(unhostVideo(hosted) ? "Removed the staged copy." : "⚠️  Could not remove the staged copy — delete the release manually.");
    }
  }
};

await main();
