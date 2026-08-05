#!/usr/bin/env node
/**
 * npm run publish:facebook -- --check
 * npm run publish:facebook -- --v=V17 [--dry-run] [--draft]
 *
 * Publishes a rendered video to Facebook Reels on the Page.
 *
 * Shares the Meta app, the Page and the token that
 * `publish-instagram.mjs --authorize` already stored — there is nothing extra
 * to authorize. What differs is the transport: **Facebook takes the bytes
 * directly** (start → upload → finish), where Instagram fetches a public URL.
 * So this needs no hosting step at all, which also means no public staging
 * copy and one less thing to clean up.
 *
 * 🔴 Credentials live in ~/.numevix-publish/credentials.json at 0600, never in
 * this repo — it is public and Pages-served.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { basename, isAbsolute, join } from "node:path";

import { loadCredentials } from "./lib/credentials.mjs";
import { buildFacebookReel, facebookUploadHeaders, validateReelVideo } from "./lib/meta.mjs";
import { alreadyUploaded } from "./lib/youtube.mjs";
import { newestRender } from "./lib/versions.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

const GRAPH = "https://graph.facebook.com/v21.0";
const STATE_PATH = process.env.NUMEVIX_STATE_PATH ?? "content/daily-state.json";
const UPLOAD_LOG = join(homedir(), ".numevix-publish", "facebook-uploads.json");

const log = (...a) => process.stdout.write(a.join(" ") + "\n");
const die = (msg) => {
  process.stderr.write(msg + "\n");
  process.exit(1);
};

const credentials = () => {
  // Deliberately reads the instagram block: one Meta app, one Page, one token.
  const c = loadCredentials()?.instagram;
  if (!c?.page_id || !c?.page_token) {
    die(
      "No Meta credentials yet.\n" +
        "Run: npm run publish:instagram -- --authorize\n" +
        "That stores the Page and token this script also uses — there is no separate\n" +
        "Facebook authorization.",
    );
  }
  return c;
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

const check = async () => {
  const c = credentials();
  const page = await graph(`/${c.page_id}`, {
    fields: "name,fan_count",
    access_token: c.page_token,
  }).catch((e) => die(`Token no longer works: ${e.message}`));

  log(`✅ Publishing to Facebook Page: ${page.name}`);
  log(`   followers: ${page.fan_count ?? "n/a"}`);
  log(`   page id:   ${c.page_id}`);

  // 🔴 Reading the Page proves nothing about POSTING to it. Publishing needs
  // pages_manage_posts, and a read-only check cannot exercise it — so --check
  // reported a healthy token that could not publish, and the gap surfaced only
  // on the first real post. Assert the scope from the token itself instead.
  const debug = await graph("/debug_token", {
    input_token: c.page_token,
    access_token: `${c.app_id}|${c.app_secret}`,
  }).catch(() => null);

  const scopes = debug?.data?.scopes ?? [];
  if (scopes.length && !scopes.includes("pages_manage_posts")) {
    die(
      "\n🔴 This token can READ the Page but not POST to it — pages_manage_posts is missing.\n\n" +
        "Fix: in Graph API Explorer add pages_manage_posts to the permissions,\n" +
        "generate a new token, then re-run:\n" +
        "  npm run publish:instagram -- --authorize\n" +
        "(one token serves both publishers). Instagram publishing is unaffected.",
    );
  }
  log(`   posting:   ${scopes.includes("pages_manage_posts") ? "permitted" : "unverified"}`);
};

/** Smallest cover beside the mp4; jpg or png. Facebook has no size ceiling worth
 * worrying about here, but the smaller file uploads faster and looks identical. */
const findCoverFile = (entry) => {
  const dir = join(homedir(), "Desktop", "Numevix Videos", "Viral", `${entry.v} - ${entry.title}`);
  if (!existsSync(dir)) return null;
  const candidates = readdirSync(dir)
    .filter((f) => /cover\.(png|jpe?g)$/i.test(f))
    .map((f) => join(dir, f))
    .sort((a, b) => statSync(a).size - statSync(b).size);
  return candidates[0] ?? null;
};

const findVideoFile = (entry) => {
  /*
    ⭐ AN ENTRY MAY CARRY ITS OWN PATH, and the card reels do.
    The folder convention below belongs to the old Remotion viral pipeline,
    which rendered into ~/Desktop/Numevix Videos/Viral/<V> - <title>/. Card
    reels are rendered by `remotion render CardReel-N` straight into the repo's
    out/reels/, so there is no such folder and no name to guess. Rather than
    teach three publishers a second naming convention, an entry can simply say
    where its file is — repo-relative or absolute — and the convention stays the
    fallback for everything that predates this.
  */
  if (entry.file) {
    const explicit = isAbsolute(entry.file) ? entry.file : join(process.cwd(), entry.file);
    return existsSync(explicit) ? explicit : null;
  }
  const dir = join(homedir(), "Desktop", "Numevix Videos", "Viral", `${entry.v} - ${entry.title}`);
  if (!existsSync(dir)) return null;
  return newestRender(dir);
};

const probe = (file) => {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
     "-show_entries", "format=duration", "-of", "json", file],
    { encoding: "utf8" },
  );
  const j = JSON.parse(out);
  return {
    seconds: Number(j.format.duration),
    width: j.streams[0].width,
    height: j.streams[0].height,
  };
};

const publish = async () => {
  const wanted = flag("v");
  if (!wanted) die("Pass --v=V17 to choose which video to publish.");

  const c = credentials();
  const state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
  const entry = state.videos.find((x) => x.v === wanted);
  if (!entry) die(`${wanted} is not in ${STATE_PATH}.`);

  const uploadLog = existsSync(UPLOAD_LOG) ? JSON.parse(readFileSync(UPLOAD_LOG, "utf8")) : [];
  const seen = alreadyUploaded(uploadLog, entry.v);
  if (seen && !has("force") && !has("dry-run")) {
    die(
      `${entry.v} was already published to Facebook on ${seen.date} (video ${seen.videoId}).\n` +
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

  const { description } = buildFacebookReel(entry);
  const size = statSync(file).size;
  const state_ = has("draft") ? "DRAFT" : "PUBLISHED";

  log(`\n${entry.v} — ${entry.title}`);
  log(`  file:  ${file} (${(size / 1e6).toFixed(1)} MB)`);
  log(`  video: ${meta.width}x${meta.height}, ${meta.seconds.toFixed(2)}s`);
  log(`  to:    facebook page ${c.page_name} (${state_})`);

  if (has("dry-run")) {
    log("\n[DRY RUN] Nothing uploaded. Description would be:\n");
    log(description);
    return;
  }

  log("\nStarting the upload session…");
  const started = await graph(`/${c.page_id}/video_reels`, {
    upload_phase: "start",
    access_token: c.page_token,
  }, "POST").catch((e) => die(`Could not start: ${e.message}`));

  log("Uploading the bytes…");
  const put = await fetch(started.upload_url, {
    method: "POST",
    // Not a normal Graph call — an OAuth header, plus offset and total size.
    headers: facebookUploadHeaders(c.page_token, size),
    body: readFileSync(file),
  });
  if (!put.ok) die(`Upload failed: ${put.status} ${await put.text()}`);

  log("Finishing…");
  const finished = await graph(`/${c.page_id}/video_reels`, {
    video_id: started.video_id,
    upload_phase: "finish",
    video_state: state_,
    description,
    access_token: c.page_token,
  }, "POST").catch((e) => die(`Could not finish: ${e.message}`));

  uploadLog.push({
    date: new Date().toISOString().slice(0, 10),
    v: entry.v,
    videoId: started.video_id,
    state: state_,
  });
  mkdirSync(join(homedir(), ".numevix-publish"), { recursive: true });
  writeFileSync(UPLOAD_LOG, JSON.stringify(uploadLog, null, 2) + "\n");

  // Cover, after publishing rather than during.
  //
  // Facebook extracts a dozen candidate frames of its own and picks one; ours only wins
  // if it is uploaded with is_preferred. Unlike Instagram — where a live Reel's cover
  // cannot be changed at all — this endpoint works on an already-published video, so it
  // is also the recovery path for anything posted before this existed.
  //
  // Deliberately non-fatal: the video is live by this point, and a wrong thumbnail is
  // worth a warning, never a failed publish that tempts a duplicate re-run.
  const coverFile = findCoverFile(entry);
  if (coverFile) {
    try {
      const form = new FormData();
      form.set("source", new Blob([readFileSync(coverFile)]), basename(coverFile));
      form.set("is_preferred", "true");
      form.set("access_token", c.page_token);
      const res = await fetch(`${GRAPH}/${started.video_id}/thumbnails`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      // 🪤 `{"success":true}` only means the request was ACCEPTED. Read the thumbnails
      // back and confirm ours is the preferred one — Facebook's own auto-extracted
      // frames sit in the same list and one of them wins by default.
      if (res.ok) {
        const list = await graph(`/${started.video_id}/thumbnails`, {
          access_token: c.page_token,
        }).catch(() => null);
        const preferred = (list?.data ?? []).find((t) => t.is_preferred);
        log(preferred ? `  cover: set (${basename(coverFile)})` : "  cover: uploaded but NOT preferred");
      } else {
        log(`  cover: failed — ${JSON.stringify(json).slice(0, 160)}`);
      }
    } catch (e) {
      log(`  cover: failed — ${e.message}`);
    }
  } else {
    log("  cover: none found — Facebook will pick its own frame");
  }

  log(`\n✅ ${state_} on Facebook Reels — video ${started.video_id}`);
  if (!finished.success && finished.success !== undefined) {
    log("⚠️  Finish returned without success:true — check the Page before assuming it is live.");
  }
};

if (has("check")) await check();
else await publish();
