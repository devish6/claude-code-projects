#!/usr/bin/env node
/**
 * npm run queue:reel -- --n=9 [--date=2026-08-05] [--force]
 *
 * Registers a rendered card reel in content/daily-state.json so the EXISTING
 * publishers can post it to YouTube, Facebook and TikTok.
 *
 * ⭐⭐ WHY A QUEUE ENTRY AND NOT A FOURTH PUBLISHER
 * publish-next.mjs already owns everything hard about multi-platform posting:
 * per-platform ledgers so a half-posted video retries only where it failed, a
 * duplicate guard per platform, oldest-first ordering, and "one platform
 * failing must not stop the others". A `publish-card-everywhere.mjs` would have
 * had to reimplement all four of those, and would have drifted from them the
 * first time one was fixed. The card reel instead becomes something that
 * machinery already understands: an entry with a file.
 *
 * 🔴 INSTAGRAM IS DELIBERATELY NOT SERVED BY THIS PATH. The card reel goes to
 * Instagram through publish-card.mjs, which keeps its own ledger in
 * ~/.numevix-publish/card-posts.json. Two publishers with two separate ledgers
 * pointing at one asset is a duplicate post waiting to happen, so the entry
 * written here is only ever handed to youtube, facebook and tiktok — see the
 * `platforms` field, and the --platforms flag on the ET launchd job.
 *
 * 🪤 TikTok is DRAFTS ONLY and accepts no caption; a person still opens the app
 * and taps publish. Queuing it controls when the draft arrives, nothing more.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { utmLinksForVideo } from "./lib/utm.mjs";
import { buildReelCaptionBody, cardHashtags } from "./lib/cards.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

const STATE = join(ROOT, "content/daily-state.json");
const BASE = "https://numevix.com/";

const log = (...a) => process.stdout.write(a.join(" ") + "\n");
const die = (m) => { process.stderr.write(m + "\n"); process.exit(1); };

/** The id a card reel is known by, on every platform ledger. */
export const reelVideoId = (n) => `M${n}R`;

/**
 * The queue entry for a rendered card reel.
 *
 * Exported so the test can assert the shape the three publishers actually read
 * — each of them throws rather than posts if a utm link is missing, and that
 * failure would otherwise only surface at 12:00 against a live API.
 */
export const buildReelEntry = ({ n, card, date, file }) => {
  const v = reelVideoId(n);
  /*
    🔴 THE BODY, NOT THE FINISHED CAPTION. buildTikTokCaption, buildFacebookReel
    and buildYouTubeMetadata each wrap this field with their own footer and
    their own hashtag line — `hashtags` below is what they read for the latter.
    Storing buildReelCaption's output here printed "Link in bio 🔗" and the full
    tag block TWICE on all three platforms, which is how M9R went out on
    2026-08-05. Instagram never showed it, because publish-card.mjs builds its
    caption live and posts it verbatim.
  */
  const caption = buildReelCaptionBody(card);

  return {
    v,
    title: `Moolank ${n} — ${card.archetype}`,
    date,
    category: "card-reel",
    moolank: n,
    /*
      🔴 WHAT THIS POST IS ABOUT, recorded so angles.mjs's 21-day no-repeat
      window can actually see it. `angleId` used to be written by NOTHING, so
      the window read every angle as never-used and "never reuse a
      previously-published content idea" was enforced only by whoever was
      reading.

      A card reel is "one number, its ruling planet and traits" — that IS
      `trait-per-number`, which content/angles.json marks REJECTED on our own
      measurements (TikTok ~205 views with 1-3 likes; Instagram 122-213 reach).
      Stamping it is not an endorsement. The queued M-series keeps posting by
      the owner's explicit ruling; the ledger just stops being silent about
      which angle it is spending.
    */
    angleId: "trait-per-number",
    status: "generated",
    // NOT "seed-existing": publish-next filters that value out as historical.
    source: "card-reel",
    needsReview: false,
    file,
    // Instagram is served by publish-card.mjs. Recorded so the reason survives
    // in the data and not only in this comment.
    platforms: ["youtube", "facebook", "tiktok"],
    tiktokCaption: caption,
    instagramCaption: caption,
    hashtags: cardHashtags(card),
    suggestedPostTime: "now",
    utmLinks: utmLinksForVideo(BASE, v, "card-reel"),
  };
};

const main = () => {
  const n = Number(flag("n"));
  if (!Number.isInteger(n) || n < 1 || n > 9) die("Pass --n=9 to choose which Moolank reel to queue.");

  const cards = JSON.parse(readFileSync(join(ROOT, "content/moolank-cards.json"), "utf8"));
  const card = cards[n];
  if (!card) die(`No card data for Moolank ${n}.`);

  const rel = `out/reels/moolank-${n}-reel.mp4`;
  if (!existsSync(join(ROOT, rel))) die(`No rendered reel at ${rel}. Render CardReel-${n} first.`);

  // A vertical video is the one thing every platform here agrees on. Checking
  // now beats discovering it inside an upload session.
  const probe = JSON.parse(execFileSync("ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
     "-show_entries", "format=duration", "-of", "json", join(ROOT, rel)], { encoding: "utf8" }));
  const { width, height } = probe.streams[0];
  if (height <= width) die(`${rel} is ${width}x${height} — the reel publishers need a vertical video.`);

  const state = JSON.parse(readFileSync(STATE, "utf8"));
  const v = reelVideoId(n);
  const existing = state.videos.findIndex((x) => x.v === v);
  if (existing !== -1 && !has("force")) {
    die(`${v} is already queued. Pass --force to overwrite its entry (this does NOT unpublish it).`);
  }

  const entry = buildReelEntry({
    n,
    card,
    date: flag("date") ?? new Date().toISOString().slice(0, 10),
    file: rel,
  });

  if (existing === -1) state.videos.push(entry);
  else state.videos[existing] = entry;

  writeFileSync(STATE, JSON.stringify(state, null, 2) + "\n");

  log(`\n${v} queued — ${entry.title}`);
  log(`  file:      ${rel} (${width}x${height}, ${Number(probe.format.duration).toFixed(2)}s)`);
  log(`  platforms: ${entry.platforms.join(", ")}   (instagram goes via publish:card)`);
  log(`\nIt will go out on the next ET slot, or now with:`);
  log(`  npm run publish:next -- --platforms=youtube,facebook,tiktok`);
};

/*
  🪤 pathToFileURL, NOT `file://${process.argv[1]}`. This repo lives under
  "Desktop/Claude Code Projects" — a path WITH SPACES — and import.meta.url
  percent-encodes them (%20) while process.argv[1] does not. The naive template
  comparison is false for every invocation here, so main() silently never ran
  and the script exited 0 having done nothing. Same shape as the publish-card
  trap where a bare number prints usage and exits 0: a success code is not
  evidence that the work happened.
*/
if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
