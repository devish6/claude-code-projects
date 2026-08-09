#!/usr/bin/env node
/**
 * npm run kit -- <V-id> [<V-id> …]
 *
 * Stages everything needed to post a video BY HAND, on the Desktop.
 *
 * ⭐ WHY THIS EXISTS: while the publishers are paused, videos still have to go
 * out — and a hand-posted video must carry the SAME caption the publisher would
 * have sent, or the comparison it exists to serve is worthless. Retyping a
 * caption introduces exactly the variable we are trying to hold still.
 *
 * So every caption here is produced by calling the real builders
 * (`buildFacebookReel`, `buildInstagramMedia`, `buildYouTubeMetadata`,
 * `buildTikTokCaption`) rather than being re-written for humans. Whatever the
 * pipeline would have posted is what lands in the folder.
 *
 * 🔴 The UTM link is still validated by those builders, so a video with no
 * `utmLinks` throws here exactly as it would in the publisher. That is
 * deliberate — an untracked post is unattributable.
 */
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

import { buildFacebookReel, buildInstagramMedia } from "./lib/meta.mjs";
import { buildYouTubeMetadata } from "./lib/youtube.mjs";
import { buildTikTokCaption } from "./lib/tiktok.mjs";

const ROOT = join(homedir(), "Desktop", "Numevix Videos", "Viral");
const OUT_ROOT = join(homedir(), "Desktop", "POST BY HAND");
const STATE = new URL("../content/daily-state.json", import.meta.url);
/** The repo itself — card reels are rendered INSIDE it, not onto the Desktop. */
const REPO = fileURLToPath(new URL("..", import.meta.url));

/**
 * ⭐ TWO ID SHAPES, BECAUSE THERE ARE TWO PROGRAMMES.
 * `V25` is a ViralVideo take living in ~/Desktop/Numevix Videos/Viral/<V> - <title>/.
 * `M5R` is a Moolank card reel, rendered to out/reels/ inside the repo and named
 * in daily-state.json as its own queue entry. Both are posted by hand the same
 * way and both must carry the publisher's exact caption, so both belong here —
 * only where the mp4 SITS differs, which `resolveSource` below absorbs.
 */
const ids = process.argv
  .slice(2)
  .filter((a) => /^(V\d+|M\d+R)$/i.test(a))
  .map((a) => a.toUpperCase());
if (!ids.length) {
  console.error("Usage: npm run kit -- V25 [V28 …]   |   npm run kit -- M5R");
  process.exit(1);
}

const state = JSON.parse(readFileSync(STATE, "utf8"));

/**
 * The newest render, chosen NUMERICALLY.
 *
 * 🪤 A lexical sort puts v9 above v10, which is how the publishers would have
 * shipped v9 for ever once anything reached double digits. Same bug, same fix.
 */
const newestRender = (dir) => {
  const takes = readdirSync(dir)
    .filter((f) => /- v(\d+)\.mp4$/i.test(f))
    .map((f) => ({ f, n: Number(f.match(/- v(\d+)\.mp4$/i)[1]) }))
    .sort((a, b) => a.n - b.n);
  if (takes.length) return takes.at(-1).f;
  return readdirSync(dir).find((f) => f.endsWith(".mp4"));
};

/**
 * Where this entry's mp4 and grid cover actually live.
 *
 * ⭐ A card reel carries an explicit repo-relative `file` in daily-state.json
 * (out/reels/moolank-5-reel.mp4) and has exactly one render, so there is no
 * take to choose. A ViralVideo carries no `file` — it is found by folder
 * convention on the Desktop and may have many takes, so `newestRender` picks.
 *
 * 🪤 THE CARD REEL'S COVER IS NOT OPTIONAL DRESSING. publish-card.mjs grabs the
 * frame at 15s — the finished info card — because Instagram otherwise picks a
 * near-empty frame off a reel that springs its type in from nothing. Posting by
 * hand has to set the same cover manually, so it is copied out alongside.
 */
const resolveSource = (entry) => {
  if (entry.file) {
    const mp4Path = join(REPO, entry.file);
    if (!existsSync(mp4Path)) {
      console.error(`${entry.v}: no render at ${mp4Path} — skipped`);
      return null;
    }
    // moolank-5-reel.mp4 → moolank-5-cover.jpg, written by publish-card.mjs.
    const guess = join(dirname(mp4Path), `${basename(mp4Path).replace(/-reel\.mp4$/i, "")}-cover.jpg`);
    return {
      mp4Path,
      coverPath: existsSync(guess) ? guess : null,
      label: entry.file,
    };
  }

  const srcDir = join(ROOT, `${entry.v} - ${entry.title}`);
  if (!existsSync(srcDir)) {
    console.error(`${entry.v}: no render folder at ${srcDir} — skipped`);
    return null;
  }
  const mp4 = newestRender(srcDir);
  if (!mp4) {
    console.error(`${entry.v}: no mp4 in ${srcDir} — skipped`);
    return null;
  }
  const cover = readdirSync(srcDir).find((f) => /cover\.(png|jpe?g)$/i.test(f));
  return {
    mp4Path: join(srcDir, mp4),
    coverPath: cover ? join(srcDir, cover) : null,
    label: mp4,
  };
};

for (const id of ids) {
  const entry = state.videos.find((v) => v.v === id);
  if (!entry) {
    console.error(`${id}: not in daily-state.json — skipped`);
    continue;
  }

  const src = resolveSource(entry);
  if (!src) continue;
  const { mp4Path, coverPath, label } = src;

  const outDir = join(OUT_ROOT, `${entry.v} - ${entry.title}`);
  mkdirSync(outDir, { recursive: true });
  copyFileSync(mp4Path, join(outDir, `${entry.v}.mp4`));

  if (coverPath) {
    copyFileSync(coverPath, join(outDir, `${entry.v} - cover${coverPath.slice(coverPath.lastIndexOf("."))}`));
  }

  // Instagram fetches from a URL in the real flow; posting by hand needs none,
  // so a placeholder satisfies the validator and the caption is unaffected.
  const ig = buildInstagramMedia(entry, "https://example.com/placeholder.mp4");
  const fb = buildFacebookReel(entry);
  const yt = buildYouTubeMetadata(entry, { privacy: "public" });
  const tt = buildTikTokCaption(entry);

  const sheet = [
    `${entry.v} — ${entry.title}`,
    `${entry.date} · ${entry.category} · render ${label}`,
    "",
    "Captions below are generated by the SAME builders the publisher uses.",
    "Paste them exactly. Do not retype or 'improve' them — holding the caption",
    "identical is the whole point of posting these by hand.",
    "",
    "═══ INSTAGRAM (Reel) ═══════════════════════════════════════════════",
    "",
    ig.caption,
    "",
    "═══ FACEBOOK (Reel) ═══════════════════════════════════════════════",
    "",
    fb.description,
    "",
    "═══ YOUTUBE (Short) ═══════════════════════════════════════════════",
    "",
    `TITLE:`,
    yt.snippet.title,
    "",
    `DESCRIPTION:`,
    yt.snippet.description,
    "",
    `TAGS: ${yt.snippet.tags.join(", ")}`,
    "",
    "═══ TIKTOK ════════════════════════════════════════════════════════",
    "",
    typeof tt === "string" ? tt : (tt.caption ?? JSON.stringify(tt)),
    "",
    "═══════════════════════════════════════════════════════════════════",
    "",
    "AFTER POSTING: send the post URLs. They go into the ledgers at",
    "~/.numevix-publish/*-uploads.json — which both stops the pipeline",
    "re-posting these later AND lets the metrics collector track them.",
    "Without that, these posts are invisible to the daily 20:00 sample.",
    "",
  ].join("\n");

  writeFileSync(join(outDir, "CAPTIONS.txt"), sheet);
  console.log(`${entry.v} → ${outDir}`);
  console.log(`   video: ${label}${coverPath ? `   cover: ${basename(coverPath)}` : "   (no cover found)"}`);
}
