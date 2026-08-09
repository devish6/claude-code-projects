/**
 * Rendered duration per V-number — the field Windsor does not have.
 *
 * 🔴 WHY THIS EXISTS: on 2026-08-08 we tried to settle whether Instagram
 * gates reach on absolute seconds or on completion percentage, and could not,
 * because only 7 of 41 published posts had a known duration. Windsor exposes
 * no duration field (`media_duration`, `video_duration`, `media_reel_duration`
 * and three other spellings all 400). The platform will never tell us. So we
 * record it at publish time, when the file is still in our hands.
 *
 * Kept as its own tiny ledger rather than a column on the four upload ledgers:
 * one V-number maps to up to four platform rows, and duration is a property of
 * the RENDER, not of any upload.
 */
import { execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

export const DURATIONS_DIR = join(homedir(), ".numevix-publish");
export const DURATIONS_FILE = "durations.json";

/** Parses `ffprobe -of default=nw=1:nk=1` output. Null when unmeasurable. */
export const parseFfprobeDuration = (stdout) => {
  const n = Number.parseFloat(String(stdout ?? "").trim());
  return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
};

/**
 * Merges measurements into the ledger.
 *
 * A real number always wins, including over an earlier real number — a
 * re-render changes the duration and the ledger must follow the file. A null
 * never writes and never erases: a probe that failed is not evidence about
 * what we shipped.
 */
export const mergeDurations = (existing, incoming) => {
  const out = { ...(existing ?? {}) };
  for (const [v, seconds] of Object.entries(incoming ?? {})) {
    if (seconds === null || seconds === undefined) continue;
    out[v] = seconds;
  }
  return out;
};

const ledgerPath = (dir = DURATIONS_DIR) => join(dir, DURATIONS_FILE);

export const loadDurations = (dir = DURATIONS_DIR) => {
  const p = ledgerPath(dir);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
};

export const probeDuration = async (path) => {
  if (!path || !existsSync(path)) return null;
  try {
    const { stdout } = await run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nw=1:nk=1",
      path,
    ]);
    return parseFfprobeDuration(stdout);
  } catch {
    return null;
  }
};

/**
 * Records one video's duration. Returns the measurement, or null.
 *
 * 🔴 NEVER THROWS. This is called from the publishers as soon as the rendered
 * file is resolved — BEFORE the upload and before the ledger write, because
 * duration is a property of the render, not of any one upload. A throw there
 * would run before anything has been posted and would make publish-next record
 * the platform as failed and re-upload the same video tomorrow. A measurement
 * must never manufacture a duplicate post — same rule as the Facebook
 * thumbnail read-back.
 */
export const recordDuration = async (v, path, dir = DURATIONS_DIR) => {
  try {
    const seconds = await probeDuration(path);
    if (seconds === null) return null;
    const merged = mergeDurations(loadDurations(dir), { [v]: seconds });
    writeFileSync(ledgerPath(dir), `${JSON.stringify(merged, null, 2)}\n`);
    return seconds;
  } catch {
    return null;
  }
};
