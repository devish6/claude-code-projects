#!/usr/bin/env node
/**
 * Export the viral compositions to ~/Desktop/Numevix Videos/Viral/.
 *
 * Every export writes a NEW version (v1, v2, …) rather than overwriting.
 * Overwriting a path that is already open in QuickTime leaves the player
 * holding a stale handle — the window goes blank and looks like a broken
 * render when the file is actually fine. Versioning removes that failure mode.
 *
 * Usage: npm run export:viral
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DEST = join(homedir(), "Desktop", "Numevix Videos", "Viral");

/** composition id → human title used for the filename */
const TARGETS = {
  "Viral-01-Identity-Seven": "V01 - Born On The 7th, 16th or 25th",
  "Viral-02-Curiosity-Hidden": "V02 - Most People Calculate This Wrong",
  "Viral-03-Contrarian-Eight": "V03 - Number 8 Is Not Unlucky",
};

mkdirSync(DEST, { recursive: true });
const existing = existsSync(DEST) ? readdirSync(DEST) : [];

/** Highest vN already present for a title, so we never clobber. */
const nextVersion = (title) => {
  const re = new RegExp(
    `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} - v(\\d+)\\.mp4$`,
  );
  const versions = existing
    .map((f) => f.match(re))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  return versions.length ? Math.max(...versions) + 1 : 1;
};

for (const [id, title] of Object.entries(TARGETS)) {
  const out = join(DEST, `${title} - v${nextVersion(title)}.mp4`);
  process.stdout.write(`→ ${id}\n  ${out}\n`);
  execFileSync("npx", ["remotion", "render", id, out, "--log=error"], {
    stdio: ["ignore", "inherit", "inherit"],
  });
}

process.stdout.write(`\nDone. ${DEST}\n`);
