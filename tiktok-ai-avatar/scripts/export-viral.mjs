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
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEST = join(homedir(), "Desktop", "Numevix Videos", "Viral");

/** composition id → folder/file title, for the fixed V01-V06 baseline. */
const TARGETS = {
  "Viral-01-Identity-Seven": "V01 - Born On The 7th, 16th or 25th",
  "Viral-02-Curiosity-Hidden": "V02 - Most People Calculate This Wrong",
  "Viral-03-Contrarian-Eight": "V03 - Number 8 Is Not Unlucky",
  "Viral-04-Identity-One": "V04 - You Hate Being Told What To Do",
  "Viral-05-Curiosity-Three": "V05 - Everyone Wants To Be A Number 3",
  "Viral-06-Contrarian-Nine": "V06 - Number 9 Is Not Angry",
  // Announcements. Hand-authored like V01-V06, so they belong here rather than
  // in the ledger-derived map below -- content/daily-state.json is deliberately
  // NOT given rows for these. nextVNumber() takes the max of the ledger AND the
  // "V<nn> - " folder names on disk, so the daily pipeline still continues at
  // V15 on its own; adding rows would instead make the ledger path try to
  // derive composition ids via compositionId(), which would never produce these.
  "Viral-13-UPI-Launch": "V13 - UPI Is Live",
  "Viral-14-UPI-Launch-Hindi": "V14 - UPI Is Live (Hindi)",
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
// Compare DECODED paths: import.meta.url percent-encodes, so the naive
// `import.meta.url === \`file://${process.argv[1]}\`` check is false for any
// checkout whose path contains a space -- and this repo lives under
// "Claude Code Projects". That made the CLI exit 0 having rendered nothing.
if (fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const filter = process.argv[2];

  // TARGETS alone is only the hand-authored V01-V06 baseline, so for a long
  // while the CLI could not re-export ANY daily-pipeline video (V07+): the
  // filter simply matched nothing and it printed "Done." having rendered
  // nothing at all. That matters most exactly when it is needed -- after a
  // change to something shared like BrandAudio, when already-shipped videos
  // have to be re-rendered. So fold the ledger's generated videos in here.
  //
  // Imported inside the CLI block on purpose: daily-viral.mjs imports THIS
  // file, so a top-level import of the state/templates modules would add an
  // import cycle and make the daily run read the ledger as a side effect.
  const { loadState } = await import("./lib/state.mjs");
  const { compositionId } = await import("./lib/templates-gen.mjs");

  const daily = Object.fromEntries(
    (loadState().videos ?? [])
      .filter((v) => v.source !== "seed-existing" && v.status === "generated")
      .map((v) => [compositionId(v), `${v.v} - ${v.title}`])
  );

  const all = { ...TARGETS, ...daily };
  let matched = 0;
  for (const [id, title] of Object.entries(all)) {
    if (filter && !`${id} ${title}`.includes(filter)) continue;
    exportOne(id, title);
    matched++;
  }

  // Never exit 0 having done nothing: a silent no-op here reads as success and
  // has already cost one debugging round (see the decoded-path note above).
  if (matched === 0) {
    process.stderr.write(
      `\nNo composition matched ${JSON.stringify(filter)}.\n` +
      `Known ids:\n${Object.keys(all).map((k) => `  ${k}`).join("\n")}\n`
    );
    process.exit(1);
  }
  process.stdout.write(`\nDone (${matched} rendered). ${DEST}\n`);
}
