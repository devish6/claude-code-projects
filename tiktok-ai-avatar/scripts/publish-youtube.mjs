#!/usr/bin/env node
/**
 * npm run publish:youtube -- --authorize
 * npm run publish:youtube -- --check
 * npm run publish:youtube -- --v=V15 [--privacy=public] [--dry-run]
 *
 * Uploads a rendered video to YouTube Shorts via the Data API v3.
 *
 * Why YouTube first: of the four platforms it is the only one that needs no
 * content audit, no publicly-hosted copy of the MP4, and no app review to
 * publish to your own channel. Quota allows 6 uploads/day, comfortably more
 * than the pipeline produces.
 *
 * 🔴 Credentials live in ~/.numevix-publish/credentials.json at 0600, never in
 * this repo — it is public and Pages-served.
 *
 * Defaults to PRIVATE. Verify one upload on the channel, then pass
 * --privacy=public. A first automated upload going straight to public on an
 * untested pipeline is visible to an audience before it is visible to us.
 */
import { createServer } from "node:http";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

import {
  CREDENTIALS_PATH,
  loadCredentials,
  requireCredentials,
  saveCredentials,
} from "./lib/credentials.mjs";
import {
  DAILY_UPLOAD_LIMIT,
  buildYouTubeMetadata,
  remainingUploadsToday,
  tokenIsExpired,
} from "./lib/youtube.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

/** Overridable so the dry run can be exercised against a fixture. */
const STATE_PATH = process.env.NUMEVIX_STATE_PATH ?? "content/daily-state.json";
const UPLOAD_LOG = join(homedir(), ".numevix-publish", "youtube-uploads.json");
const SCOPE = "https://www.googleapis.com/auth/youtube.upload";

const log = (...a) => process.stdout.write(a.join(" ") + "\n");
const die = (msg) => {
  process.stderr.write(msg + "\n");
  process.exit(1);
};

// ── One-time authorization ──────────────────────────────────────────────────
/**
 * Loopback redirect, not the out-of-band flow: Google deprecated `oob` for
 * desktop clients, so the code comes back to a local server instead.
 */
const authorize = async () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  log("\nPaste the two values from your Google Cloud OAuth client (Desktop app).\n");
  const clientId = (await rl.question("client_id: ")).trim();
  const clientSecret = (await rl.question("client_secret: ")).trim();
  rl.close();

  if (!clientId || !clientSecret) die("Both values are required.");

  const { port, codePromise } = await startLoopbackServer();
  const redirectUri = `http://127.0.0.1:${port}`;

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPE,
      // Required to get a refresh token at all, and `consent` forces one to be
      // reissued even if this client was authorized before.
      access_type: "offline",
      prompt: "consent",
    });

  log("\nOpen this URL, sign in as the channel owner, and grant access:\n");
  log(authUrl + "\n");
  log("(If Google warns the app is unverified, choose Advanced → Continue.)\n");

  const code = await codePromise;
  log("Got the authorization code. Exchanging it for tokens…");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await res.json();
  if (!res.ok) die(`Token exchange failed: ${JSON.stringify(tokens)}`);
  if (!tokens.refresh_token) {
    die(
      "Google returned no refresh_token, so unattended posting would break.\n" +
        "Revoke this app at myaccount.google.com/permissions and run --authorize again.",
    );
  }

  saveCredentials({
    youtube: {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refresh_token,
    },
  });

  log(`\n✅ Stored in ${CREDENTIALS_PATH} (owner-readable only).`);
  log("⚠️  While the OAuth app is in Testing status Google expires refresh tokens");
  log("   after 7 days. Publish the app to Production in the consent screen to");
  log("   keep unattended posting working.");
};

const startLoopbackServer = () =>
  new Promise((resolve) => {
    let resolveCode;
    const codePromise = new Promise((r) => (resolveCode = r));

    const server = createServer((req, res) => {
      const url = new URL(req.url, "http://127.0.0.1");
      const code = url.searchParams.get("code");
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(code ? "Authorized. You can close this tab." : "No code received.");
      if (code) {
        server.close();
        resolveCode(code);
      }
    });

    server.listen(0, "127.0.0.1", () => resolve({ port: server.address().port, codePromise }));
  });

// ── Access tokens ───────────────────────────────────────────────────────────
const accessToken = async () => {
  const creds = requireCredentials("youtube");
  const stored = loadCredentials()?.youtube ?? {};

  if (!tokenIsExpired(stored.token)) return stored.token.access_token;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    die(
      `Refresh failed: ${JSON.stringify(json)}\n` +
        "If this says invalid_grant, the refresh token expired — that happens after\n" +
        "7 days while the OAuth app is in Testing. Publish it to Production, then\n" +
        "run --authorize again.",
    );
  }

  saveCredentials({
    youtube: {
      token: {
        access_token: json.access_token,
        expiry: new Date(Date.now() + json.expires_in * 1000).toISOString(),
      },
    },
  });
  return json.access_token;
};

// ── Upload ──────────────────────────────────────────────────────────────────
const findVideoFile = (entry) => {
  const dir = join(homedir(), "Desktop", "Numevix Videos", "Viral", `${entry.v} - ${entry.title}`);
  if (!existsSync(dir)) return null;
  const mp4 = readdirSync(dir)
    .filter((f) => f.endsWith(".mp4"))
    .sort()
    .at(-1);
  return mp4 ? join(dir, mp4) : null;
};

const upload = async () => {
  const wanted = flag("v");
  if (!wanted) die("Pass --v=V15 to choose which video to upload.");

  const state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
  const entry = state.videos.find((x) => x.v === wanted);
  if (!entry) die(`${wanted} is not in ${STATE_PATH}.`);

  const privacy = flag("privacy") ?? "private";
  let meta;
  try {
    meta = buildYouTubeMetadata(entry, { privacy });
  } catch (err) {
    // A stack trace here is noise: these are all "fix the input" problems.
    die(
      `${String(err?.message ?? err)}\n` +
        "Videos generated before the UTM join key landed have no link, and posting\n" +
        "them would produce traffic that can never be attributed. Re-run the\n" +
        "pipeline to regenerate this video with a link.",
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const uploadLog = existsSync(UPLOAD_LOG) ? JSON.parse(readFileSync(UPLOAD_LOG, "utf8")) : [];
  const remaining = remainingUploadsToday(uploadLog, today);
  if (remaining === 0) {
    die(
      `Daily quota reached (${DAILY_UPLOAD_LIMIT} uploads). videos.insert costs 1600 of\n` +
        "10,000 units/day. Try again tomorrow, or request more quota.",
    );
  }

  const file = findVideoFile(entry);
  if (!file) die(`No rendered MP4 found for ${entry.v}. Run the pipeline first.`);

  log(`\n${entry.v} — ${entry.title}`);
  log(`  file:    ${file} (${(statSync(file).size / 1e6).toFixed(1)} MB)`);
  log(`  title:   ${meta.snippet.title}`);
  log(`  privacy: ${meta.status.privacyStatus}`);
  log(`  link:    ${entry.utmLinks.youtube}`);
  log(`  quota:   ${remaining} of ${DAILY_UPLOAD_LIMIT} uploads left today`);

  if (has("dry-run")) {
    log("\n[DRY RUN] Nothing uploaded. Full description:\n");
    log(meta.snippet.description);
    return;
  }

  const token = await accessToken();

  // Resumable upload: start a session, then send the bytes to the returned URL.
  const init = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": String(statSync(file).size),
      },
      body: JSON.stringify(meta),
    },
  );
  if (!init.ok) die(`Could not start the upload: ${init.status} ${await init.text()}`);

  const sessionUrl = init.headers.get("location");
  if (!sessionUrl) die("YouTube did not return an upload session URL.");

  log("\nUploading…");
  const put = await fetch(sessionUrl, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(statSync(file).size) },
    body: createReadStream(file),
    duplex: "half",
  });
  const result = await put.json();
  if (!put.ok) die(`Upload failed: ${put.status} ${JSON.stringify(result)}`);

  uploadLog.push({ date: today, v: entry.v, videoId: result.id, privacy });
  saveUploadLog(uploadLog);

  log(`\n✅ https://youtube.com/watch?v=${result.id}  (${meta.status.privacyStatus})`);
  if (privacy === "private") {
    log("   Private — check it on the channel, then re-run with --privacy=public.");
  }
};

const saveUploadLog = (rows) => {
  mkdirSync(join(homedir(), ".numevix-publish"), { recursive: true });
  writeFileSync(UPLOAD_LOG, JSON.stringify(rows, null, 2) + "\n");
};

/**
 * Verifies the stored grant still works, without uploading anything.
 *
 * Worth having permanently: the refresh token is the part that silently dies
 * (after 7 days while the OAuth app sits in Testing), and the first sign of
 * that would otherwise be a failed batch.
 */
const check = async () => {
  const token = await accessToken();
  const stored = loadCredentials()?.youtube ?? {};

  log("✅ Refresh grant works — a new access token was issued.");
  log(`   expires: ${stored.token?.expiry ?? "unknown"}`);
  log(`   scope:   ${SCOPE}`);
  log(`   token:   ${token.slice(0, 6)}… (not shown)`);
  log("\nNote: this proves OAuth only. Whether the YouTube Data API is enabled");
  log("on the project shows up on the first real upload.");
};

if (has("authorize")) {
  await authorize();
} else if (has("check")) {
  await check();
} else {
  await upload();
}
