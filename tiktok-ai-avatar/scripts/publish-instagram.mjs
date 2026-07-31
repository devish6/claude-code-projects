#!/usr/bin/env node
/**
 * npm run publish:instagram -- --authorize
 * npm run publish:instagram -- --check
 * npm run publish:instagram -- --v=V17 [--dry-run] [--keep-hosted]
 *
 * Publishes a rendered video to Instagram Reels via the Instagram Graph API.
 *
 * Two things make this unlike the YouTube publisher:
 *
 * 1. **Instagram fetches the file.** It does not accept an upload, so the mp4
 *    is staged on a public GitHub release for the few minutes Instagram needs
 *    to download it, then removed. See lib/media-host.mjs.
 * 2. **Publishing is asynchronous and two-phase.** Create a container, wait
 *    for Instagram to transcode it, then publish the container id. Publishing
 *    early fails, so this polls.
 *
 * 🔴 Credentials live in ~/.numevix-publish/credentials.json at 0600, never in
 * this repo — it is public and Pages-served.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

import { CREDENTIALS_PATH, loadCredentials, saveCredentials } from "./lib/credentials.mjs";
import {
  buildInstagramMedia,
  containerState,
  pageIdsFromGranularScopes,
  validateReelVideo,
} from "./lib/meta.mjs";
import { hostVideo, unhostVideo } from "./lib/media-host.mjs";
import { alreadyUploaded } from "./lib/youtube.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

const GRAPH = "https://graph.facebook.com/v21.0";
const STATE_PATH = process.env.NUMEVIX_STATE_PATH ?? "content/daily-state.json";
const UPLOAD_LOG = join(homedir(), ".numevix-publish", "instagram-uploads.json");

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

// ── Authorization ───────────────────────────────────────────────────────────
/**
 * Meta has no desktop OAuth loop worth building for a single user, so the
 * short-lived token is pasted in once and everything else is derived:
 * exchanged for a long-lived token, then the Page and its linked Instagram
 * account are DISCOVERED rather than asked for — those ids are the part people
 * most often get wrong by hand.
 */
const authorize = async () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  log("\nFrom your Meta app (developers.facebook.com):\n");
  const appId = (await rl.question("app id: ")).trim();
  const appSecret = (await rl.question("app secret: ")).trim();
  log("\nFrom Graph API Explorer, a User token with these scopes:");
  log("  instagram_basic, instagram_content_publish, pages_show_list,");
  // 🔴 pages_manage_posts is for FACEBOOK Reels, not Instagram. Omitting it
  // still authorizes fine and still passes --check, because reading a Page
  // needs nothing extra — it fails only on the first real Facebook post.
  log("  pages_read_engagement, pages_manage_posts\n");
  const shortToken = (await rl.question("short-lived user token: ")).trim();
  rl.close();

  if (!appId || !appSecret || !shortToken) die("All three values are required.");

  log("\nExchanging for a long-lived token…");
  const longLived = await graph("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  }).catch((e) => die(`Exchange failed: ${e.message}`));

  const userToken = longLived.access_token;

  log("Finding your Pages…");
  let candidates = await graph("/me/accounts", { access_token: userToken })
    .then((r) => r.data ?? [])
    .catch((e) => die(`Could not list Pages: ${e.message}`));

  // 🪤 /me/accounts can return [] for a token that plainly holds the Page.
  // Seen 2026-07-30: the debugger showed `pages_show_list → 1239712085890849 :
  // Numevix` while this edge stayed empty, and no amount of re-consenting
  // changed it — the grant was never the problem. Granular scopes are the
  // authoritative record, so fall back to them and address the Page directly.
  if (!candidates.length) {
    log("  /me/accounts was empty — reading the token's granular scopes instead…");
    const debug = await graph("/debug_token", {
      input_token: userToken,
      access_token: `${appId}|${appSecret}`,
    }).catch(() => null);

    for (const id of pageIdsFromGranularScopes(debug)) {
      const page = await graph(`/${id}`, {
        fields: "access_token,name",
        access_token: userToken,
      }).catch(() => null);
      if (page?.access_token) candidates.push(page);
    }
    if (candidates.length) log(`  recovered ${candidates.length} Page(s) this way.`);
  }

  if (!candidates.length) {
    // An empty list is ambiguous, and the two causes need different fixes.
    // Distinguishing them here saves a round of guessing.
    die(
      "No Page found — not from /me/accounts, and not from the token's scopes.\n\n" +
        "The granular-scope fallback already covers the case where /me/accounts\n" +
        "is empty but the Page was granted, so reaching here means the token\n" +
        "genuinely carries no Page. Two causes:\n\n" +
        "1. THE PAGE WASN'T GRANTED. The Facebook dialog asks which Pages the app\n" +
        "   may use, and it is easy to click past. Note that 'Reconnect' RE-USES\n" +
        "   the previous choices without asking again — use 'Edit settings' on that\n" +
        "   dialog, or remove the app under facebook.com/settings?tab=business_tools\n" +
        "   and authorize fresh.\n" +
        "   Verify at developers.facebook.com/tools/debug/accesstoken/ — the\n" +
        "   Granular Scopes table must show a Page id beside pages_show_list.\n" +
        "   That table, not /me/accounts, is the source of truth.\n\n" +
        "2. THERE IS NO PAGE. Instagram Reels publishing needs one; a Creator or\n" +
        "   Business Instagram account alone is not enough.\n" +
        "   Fix: create a Page at facebook.com/pages/create, then link it in\n" +
        "   Instagram → Settings → Account type and tools → Sharing to other apps.\n\n" +
        "Check which one you are in at: facebook.com/pages/?category=your_pages",
    );
  }

  // Find the Page whose linked Instagram account we can publish to.
  let chosen = null;
  for (const page of candidates) {
    const linked = await graph(`/${page.id}`, {
      fields: "instagram_business_account,name",
      access_token: page.access_token,
    }).catch(() => null);
    if (linked?.instagram_business_account?.id) {
      chosen = { page, igId: linked.instagram_business_account.id, pageName: linked.name };
      break;
    }
  }

  if (!chosen) {
    die(
      "None of your Pages has an Instagram Business/Creator account linked.\n" +
        "In the Instagram app: Settings → Account type → switch to Business or Creator,\n" +
        "then link it to a Facebook Page. Re-run --authorize afterwards.",
    );
  }

  saveCredentials({
    instagram: {
      app_id: appId,
      app_secret: appSecret,
      page_id: chosen.page.id,
      page_name: chosen.pageName,
      page_token: chosen.page.access_token,
      ig_user_id: chosen.igId,
    },
  });

  log(`\n✅ Stored in ${CREDENTIALS_PATH} (owner-readable only).`);
  log(`   Page:      ${chosen.pageName} (${chosen.page.id})`);
  log(`   Instagram: ${chosen.igId}`);
  log("\nUnlike YouTube, this one CAN name the target account — so you can see now");
  log("whether it is the right one, rather than after the first post.");
};

// ── Check ───────────────────────────────────────────────────────────────────
const check = async () => {
  const c = loadCredentials()?.instagram;
  if (!c?.ig_user_id) die(`No Instagram credentials. Run --authorize first.`);

  const me = await graph(`/${c.ig_user_id}`, {
    fields: "username,followers_count,media_count",
    access_token: c.page_token,
  }).catch((e) => die(`Token no longer works: ${e.message}\nRun --authorize again.`));

  log(`✅ Publishing to @${me.username}`);
  log(`   followers: ${me.followers_count}   posts: ${me.media_count}`);
  log(`   page:      ${c.page_name} (${c.page_id})`);
};

// ── Publish ─────────────────────────────────────────────────────────────────
const findVideoFile = (entry) => {
  const dir = join(homedir(), "Desktop", "Numevix Videos", "Viral", `${entry.v} - ${entry.title}`);
  if (!existsSync(dir)) return null;
  const mp4 = readdirSync(dir).filter((f) => f.endsWith(".mp4")).sort().at(-1);
  return mp4 ? join(dir, mp4) : null;
};

const probe = (file) => {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries",
     "stream=width,height", "-show_entries", "format=duration", "-of", "json", file],
    { encoding: "utf8" },
  );
  const j = JSON.parse(out);
  return {
    seconds: Number(j.format.duration),
    width: j.streams[0].width,
    height: j.streams[0].height,
  };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const publish = async () => {
  const wanted = flag("v");
  if (!wanted) die("Pass --v=V17 to choose which video to publish.");

  const c = loadCredentials()?.instagram;
  if (!c?.ig_user_id) die("No Instagram credentials. Run --authorize first.");

  const state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
  const entry = state.videos.find((x) => x.v === wanted);
  if (!entry) die(`${wanted} is not in ${STATE_PATH}.`);

  const uploadLog = existsSync(UPLOAD_LOG) ? JSON.parse(readFileSync(UPLOAD_LOG, "utf8")) : [];
  const seen = alreadyUploaded(uploadLog, entry.v);
  if (seen && !has("force")) {
    die(
      `${entry.v} was already published to Instagram on ${seen.date} (media ${seen.mediaId}).\n` +
        "Re-running would post a duplicate. Pass --force only if that is genuinely wanted.",
    );
  }

  const file = findVideoFile(entry);
  if (!file) die(`No rendered MP4 found for ${entry.v}. Run the pipeline first.`);

  const meta = probe(file);
  try {
    validateReelVideo(meta);
  } catch (err) {
    die(`${entry.v} is not a valid Reel: ${err.message}`);
  }

  log(`\n${entry.v} — ${entry.title}`);
  log(`  file:  ${file} (${(statSync(file).size / 1e6).toFixed(1)} MB)`);
  log(`  video: ${meta.width}x${meta.height}, ${meta.seconds.toFixed(2)}s`);
  log(`  to:    instagram ${c.ig_user_id} via page ${c.page_name}`);

  if (has("dry-run")) {
    const preview = buildInstagramMedia(entry, "https://example.com/placeholder.mp4");
    log("\n[DRY RUN] Nothing hosted, nothing posted. Caption would be:\n");
    log(preview.caption);
    return;
  }

  log("\nStaging the file so Instagram can fetch it…");
  const hosted = hostVideo(entry, file);
  log(`  ${hosted.url}`);

  try {
    const media = buildInstagramMedia(entry, hosted.url);

    log("Creating the media container…");
    const container = await graph(`/${c.ig_user_id}/media`, {
      ...media,
      access_token: c.page_token,
    }, "POST");

    log("Waiting for Instagram to transcode it…");
    let state_ = { done: false };
    for (let i = 0; i < 30 && !state_.done; i++) {
      await sleep(5000);
      const status = await graph(`/${container.id}`, {
        fields: "status_code,status",
        access_token: c.page_token,
      });
      state_ = containerState(status);
      if (!state_.done) process.stdout.write(".");
    }
    process.stdout.write("\n");

    if (!state_.ok) {
      die(`Instagram could not process the video: ${state_.reason ?? "timed out"}`);
    }

    log("Publishing…");
    const published = await graph(`/${c.ig_user_id}/media_publish`, {
      creation_id: container.id,
      access_token: c.page_token,
    }, "POST");

    uploadLog.push({
      date: new Date().toISOString().slice(0, 10),
      v: entry.v,
      mediaId: published.id,
    });
    mkdirSync(join(homedir(), ".numevix-publish"), { recursive: true });
    writeFileSync(UPLOAD_LOG, JSON.stringify(uploadLog, null, 2) + "\n");

    log(`\n✅ Published to Instagram Reels — media ${published.id}`);
  } finally {
    // Always clean up the staged copy, even if publishing failed — it is a
    // public download link on a public repo and has no reason to persist.
    if (!has("keep-hosted")) {
      log(unhostVideo(hosted) ? "Removed the staged copy." : "⚠️  Could not remove the staged copy — delete the release manually.");
    }
  }
};

if (has("authorize")) await authorize();
else if (has("check")) await check();
else await publish();
