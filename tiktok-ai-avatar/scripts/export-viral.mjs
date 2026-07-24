#!/usr/bin/env node
/**
 * Export viral compositions to ~/Desktop/Numevix Videos/Viral/.
 *
 * Layout matches the existing promo folders -- one directory per video
 * holding the MP4 and its cover:
 *
 *   Viral/V01 - Title/V01 - Title - v1.mp4
 *   Viral/V01 - Title/V01 - Title - cover.png
 *
 * Videos are VERSIONED and never overwritten. Re-rendering onto a path that is
 * open in QuickTime leaves the player holding a stale handle, so the window
 * goes blank and reads as a broken render when the file is fine.
 *
 * Covers are unversioned -- a still has no such failure mode and a single
 * current thumbnail per video is easier to grab.
 *
 * Usage (CLI, unchanged -- exports the fixed V01-V06 baseline):
 *   npm run export:viral            # everything
 *   npm run export:viral -- V04     # only ids containing "V04"
 *
 * Reused as a module by scripts/daily-viral.mjs, which exports the daily
 * V07+ compositions through the same `exportOne` / `nextVersion` helpers so
 * there is exactly one place that knows how to write into the Viral/ folder
 * safely (no second exporter).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const DEST = join(homedir(), "Desktop", "Numevix Videos", "Viral");

/** composition id → folder/file title, for the fixed V01-V06 baseline. */
const TARGETS = {
  "Viral-01-Identity-Seven": "V01 - Born On The 7th, 16th or 25th",
  "Viral-02-Curiosity-Hidden": "V02 - Most People Calculate This Wrong",
  "Viral-03-Contrarian-Eight": "V03 - Number 8 Is Not Unlucky",
  "Viral-04-Identity-One": "V04 - You Hate Being Told What To Do",
  "Viral-05-Curiosity-Three": "V05 - Everyone Wants To Be A Number 3",
  "Viral-06-Contrarian-Nine": "V06 - Number 9 Is Not Angry",
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Highest vN already in the video's folder, so we never clobber. */
export const nextVersion = (dir, title) => {
  if (!existsSync(dir)) return 1;
  const re = new RegExp(`^${escape(title)} - v(\\d+)\\.mp4$`);
  const versions = readdirSync(dir)
    .map((f) => f.match(re))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  return versions.length ? Math.max(...versions) + 1 : 1;
};

const run = (args) =>
  execFileSync("npx", args, { stdio: ["ignore", "inherit", "inherit"] });

/**
 * Render + still-export ONE composition into DEST/<title>/, versioned MP4 +
 * unversioned cover. Throws on failure -- callers (daily-viral.mjs) decide
 * whether one failure should stop the whole batch (the CLI path below does;
 * the daily pipeline does NOT, so one bad render can't take out the other
 * two videos in the day's batch).
 */
export const exportOne = (id, title, destRoot = DEST) => {
  const dir = join(destRoot, title);
  mkdirSync(dir, { recursive: true });

  const video = join(dir, `${title} - v${nextVersion(dir, title)}.mp4`);
  const cover = join(dir, `${title} - cover.png`);

  process.stdout.write(`\n→ ${title}\n`);
  run(["remotion", "render", id, video, "--log=error"]);
  // frame 30: the dial has rotated into position and the motes have spread.
  run(["remotion", "still", `${id}-Cover`, cover, "--frame=30", "--log=error"]);

  return { dir, video, cover };
};

// Only run the CLI export when this file is executed directly (not imported).
if (import.meta.url === `file://${process.argv[1]}`) {
  const filter = process.argv[2];
  for (const [id, title] of Object.entries(TARGETS)) {
    if (filter && !`${id} ${title}`.includes(filter)) continue;
    exportOne(id, title);
  }
  process.stdout.write(`\nDone. ${DEST}\n`);
}
