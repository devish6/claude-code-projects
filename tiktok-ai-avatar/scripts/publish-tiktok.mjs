#!/usr/bin/env node
/**
 * npm run publish:tiktok -- --authorize
 * npm run publish:tiktok -- --check
 * npm run publish:tiktok -- --v=V17 [--dry-run]
 *
 * Sends a rendered video to TikTok as a DRAFT, using the Content Posting API's
 * inbox endpoint.
 *
 * Two things make this unlike the other publishers:
 *
 * 1. **Nothing is posted.** The video lands in your TikTok drafts and a person
 *    opens the app and taps publish. That is deliberate — it needs no audit
 *    (`video.upload`, not `video.publish`), and it keeps a human between the
 *    pipeline and the feed while the account rebuilds after the ban.
 * 2. **The inbox endpoint takes NO caption.** TikTok's draft flow has you
 *    write it in the app, so this prints the caption and copies it to the
 *    clipboard for pasting rather than sending it.
 *
 * Transport is push_by_file: we upload the bytes, so nothing is hosted and no
 * domain needs verifying.
 *
 * 🔴 Credentials live in ~/.numevix-publish/credentials.json at 0600, never in
 * this repo — it is public and Pages-served.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";

import { CREDENTIALS_PATH, loadCredentials, saveCredentials } from "./lib/credentials.mjs";
import {
  authorizeUrl,
  buildTikTokCaption,
  chunkPlan,
  publishState,
  uploadHeaders,
  validateTikTokVideo,
} from "./lib/tiktok.mjs";
import { alreadyUploaded } from "./lib/youtube.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

const API = "https://open.tiktokapis.com/v2";
const REDIRECT_URI = "https://devish6.github.io/claude-code-projects/tiktok-auth.html";
const STATE_PATH = process.env.NUMEVIX_STATE_PATH ?? "content/daily-state.json";
const UPLOAD_LOG = join(homedir(), ".numevix-publish", "tiktok-uploads.json");

const log = (...a) => process.stdout.write(a.join(" ") + "\n");
const die = (msg) => {
  process.stderr.write(msg + "\n");
  process.exit(1);
};

const api = async (path, { token, body, form } = {}) => {
  const res = await fetch(`${API}${path}`, {
    method: form || body ? "POST" : "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(form ? { body: new URLSearchParams(form) } : {}),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json();

  // TikTok returns HTTP 200 with an error object inside, so status alone is
  // not enough to know the call worked.
  const err = json?.error;
  if (!res.ok || (err && err.code && err.code !== "ok")) {
    throw new Error(`${path} → ${res.status} ${JSON.stringify(err ?? json)}`);
  }
  return json;
};

// ── Authorization ───────────────────────────────────────────────────────────

const authorize = async () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  // Re-uses the stored app credentials when there are any. Beyond saving two
  // paste steps, this keeps the client secret OFF THE SCREEN — re-authorizing
  // is exactly what you do while screen-recording the flow for TikTok's app
  // review, and a prompt here would echo the secret into the video file.
  const stored = loadCredentials()?.tiktok;
  let clientKey = stored?.client_key;
  let clientSecret = stored?.client_secret;

  if (clientKey && clientSecret) {
    log(`\nUsing the stored app credentials (client key ${clientKey}).`);
    log("Delete the tiktok block in the credentials file to enter different ones.");
  } else {
    log("\nFrom developers.tiktok.com → your app → Credentials:\n");
    clientKey = (await rl.question("client key: ")).trim();
    clientSecret = (await rl.question("client secret: ")).trim();
  }

  if (!clientKey || !clientSecret) {
    rl.close();
    die("Both values are required.");
  }

  // Proves the code that comes back belongs to the request we started — the
  // callback page is public and static, so nothing else does.
  const state = randomBytes(16).toString("hex");

  log("\nOpen this in your browser and approve:\n");
  log(authorizeUrl({ clientKey, redirectUri: REDIRECT_URI, state }));
  log("\nYou will land on the Numevix callback page. Copy the code it shows.\n");

  const code = (await rl.question("authorization code: ")).trim();
  const returnedState = (await rl.question(`state shown on the page (expecting ${state}): `)).trim();
  rl.close();

  if (returnedState !== state) {
    die(
      `State mismatch — expected ${state}, got ${returnedState}.\n` +
        "Do not continue: the code may belong to a different request.",
    );
  }

  log("\nExchanging the code for a token…");
  const token = await api("/oauth/token/", {
    form: {
      client_key: clientKey,
      client_secret: clientSecret,
      code: decodeURIComponent(code),
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    },
  }).catch((e) => die(`Exchange failed: ${e.message}`));

  const who = await api("/user/info/?fields=open_id,display_name", {
    token: token.access_token,
  }).catch(() => null);

  saveCredentials({
    tiktok: {
      client_key: clientKey,
      client_secret: clientSecret,
      refresh_token: token.refresh_token,
      open_id: token.open_id,
      display_name: who?.data?.user?.display_name ?? null,
      token: {
        access_token: token.access_token,
        // TikTok access tokens last 24h; the refresh token is the durable one.
        expiry: Date.now() + token.expires_in * 1000,
      },
    },
  });

  log(`\n✅ Stored in ${CREDENTIALS_PATH} (owner-readable only).`);
  log(`   Account: ${who?.data?.user?.display_name ?? token.open_id}`);
  log("\nVideos will arrive as DRAFTS. Nothing posts without you tapping publish.");
};

// ── Tokens ──────────────────────────────────────────────────────────────────

const credentials = () => {
  const c = loadCredentials()?.tiktok;
  if (!c?.refresh_token) die("No TikTok credentials. Run --authorize first.");
  return c;
};

/**
 * A valid access token, refreshed if needed.
 *
 * 🪤 TikTok ROTATES the refresh token on every refresh — the response carries a
 * new one, and the old stops working. Persisting only the access token would
 * work for 24h and then lock us out permanently.
 */
const accessToken = async () => {
  const c = credentials();
  if (c.token?.access_token && c.token.expiry > Date.now() + 60_000) {
    return c.token.access_token;
  }

  const fresh = await api("/oauth/token/", {
    form: {
      client_key: c.client_key,
      client_secret: c.client_secret,
      grant_type: "refresh_token",
      refresh_token: c.refresh_token,
    },
  }).catch((e) => die(`Could not refresh the token: ${e.message}\nRun --authorize again.`));

  saveCredentials({
    tiktok: {
      ...c,
      refresh_token: fresh.refresh_token ?? c.refresh_token,
      token: {
        access_token: fresh.access_token,
        expiry: Date.now() + fresh.expires_in * 1000,
      },
    },
  });
  return fresh.access_token;
};

const check = async () => {
  const token = await accessToken();
  const who = await api("/user/info/?fields=open_id,display_name", { token }).catch((e) =>
    die(`Token no longer works: ${e.message}\nRun --authorize again.`),
  );

  const user = who.data.user;
  log(`✅ Publishing drafts to TikTok: ${user.display_name ?? user.open_id}`);
  log("   mode: inbox (draft) — nothing posts without you tapping publish");
};

// ── Publishing ──────────────────────────────────────────────────────────────

const findVideoFile = (entry) => {
  const dir = join(homedir(), "Desktop", "Numevix Videos", "Viral", `${entry.v} - ${entry.title}`);
  if (!existsSync(dir)) return null;
  const mp4 = readdirSync(dir).filter((f) => f.endsWith(".mp4")).sort().at(-1);
  return mp4 ? join(dir, mp4) : null;
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
  if (!wanted) die("Pass --v=V17 to choose which video to send.");

  const state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
  const entry = state.videos.find((x) => x.v === wanted);
  if (!entry) die(`${wanted} is not in ${STATE_PATH}.`);

  const uploadLog = existsSync(UPLOAD_LOG) ? JSON.parse(readFileSync(UPLOAD_LOG, "utf8")) : [];
  const seen = alreadyUploaded(uploadLog, entry.v);
  if (seen && !has("force")) {
    die(
      `${entry.v} was already sent to TikTok on ${seen.date} (publish ${seen.videoId}).\n` +
        "Re-running would put a duplicate in your drafts. Pass --force if that is wanted.",
    );
  }

  const file = findVideoFile(entry);
  if (!file) die(`No rendered MP4 found for ${entry.v}. Run the pipeline first.`);

  const meta = probe(file);
  try {
    validateTikTokVideo(meta);
  } catch (err) {
    die(`${entry.v} is not publishable: ${err.message}`);
  }

  // Built before anything is sent: it throws when the UTM link is missing, and
  // failing that check after the upload would leave an untracked draft behind.
  const caption = buildTikTokCaption(entry);
  const size = statSync(file).size;
  const plan = chunkPlan(size);

  log(`\n${entry.v} — ${entry.title}`);
  log(`  file:  ${file} (${(size / 1e6).toFixed(1)} MB)`);
  log(`  video: ${meta.width}x${meta.height}, ${meta.seconds.toFixed(2)}s`);
  log(`  to:    TikTok drafts`);

  if (has("dry-run")) {
    log("\n[DRY RUN] Nothing uploaded. Caption would be:\n");
    log(caption);
    return;
  }

  const token = await accessToken();

  log("\nInitialising the upload…");
  const init = await api("/post/publish/inbox/video/init/", {
    token,
    body: { source_info: { source: "FILE_UPLOAD", ...plan } },
  }).catch((e) => die(`Could not initialise: ${e.message}`));

  const { publish_id, upload_url } = init.data;

  log("Uploading the bytes…");
  const put = await fetch(upload_url, {
    method: "PUT",
    headers: uploadHeaders(size),
    body: readFileSync(file),
  });
  if (!put.ok) die(`Upload failed: ${put.status} ${await put.text()}`);

  log("Waiting for TikTok to accept it…");
  let final = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const status = await api("/post/publish/status/fetch/", {
      token,
      body: { publish_id },
    }).catch(() => null);

    const s = publishState(status);
    if (s.done) {
      if (!s.ok) die(`TikTok rejected it: ${s.reason}`);
      final = status;
      break;
    }
  }
  if (!final) die("Timed out waiting for TikTok. Check your drafts before re-running.");

  uploadLog.push({
    date: new Date().toISOString().slice(0, 10),
    v: entry.v,
    videoId: publish_id,
    mode: "inbox",
  });
  mkdirSync(join(homedir(), ".numevix-publish"), { recursive: true });
  writeFileSync(UPLOAD_LOG, JSON.stringify(uploadLog, null, 2) + "\n");

  log(`\n✅ ${entry.v} is in your TikTok drafts (publish ${publish_id}).`);

  // The inbox endpoint accepts no caption, so this is the one manual step.
  // Putting it on the clipboard means it is a paste, not a retype.
  try {
    execFileSync("pbcopy", { input: caption });
    log("📋 Caption copied to your clipboard — paste it when you publish.\n");
  } catch {
    log("\nCaption to paste when you publish:\n");
  }
  log(caption);
};

if (has("authorize")) await authorize();
else if (has("check")) await check();
else await publish();
