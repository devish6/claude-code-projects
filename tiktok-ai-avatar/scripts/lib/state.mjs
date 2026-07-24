/**
 * content/daily-state.json I/O + the no-repeat / numbering rules.
 *
 * This is the ledger for every video the pipeline has ever generated (plus
 * seed rows for the hand-built V01-V06 baseline, kept for no-repeat history
 * only -- see source: "seed-existing"). It is the single source of truth
 * daily-templates.ts gets regenerated from.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

export const STATE_PATH = "content/daily-state.json";
export const REPEAT_WINDOW_DAYS = 21;

export const loadState = (path = STATE_PATH) =>
  JSON.parse(readFileSync(path, "utf8"));

export const saveState = (state, path = STATE_PATH) =>
  writeFileSync(path, JSON.stringify(state, null, 2) + "\n");

const daysBetween = (a, b) => Math.abs((new Date(a) - new Date(b)) / 86_400_000);

/** True if this hookId / moolank / category was used within the window of `asOf`. */
export const isRecentlyUsed = (state, { hookId, moolank, category }, asOf) => {
  return state.videos.some((v) => {
    if (v.status === "failed") return false;
    if (daysBetween(v.date, asOf) > REPEAT_WINDOW_DAYS) return false;
    if (hookId && v.hookId === hookId) return true;
    if (
      moolank !== undefined &&
      moolank !== "general" &&
      v.moolank === moolank &&
      v.category === category
    ) {
      // Same number AND same category within the window reads as a repeat;
      // the same number in a *different* category (e.g. identity vs story)
      // is a deliberate callback, not a repeat.
      return true;
    }
    return false;
  });
};

/**
 * Next V-number: highest of (a) everything already in state and (b) whatever
 * "V<nn> - ..." folders already exist on disk in destRoot, plus one. Reading
 * the real Desktop folder is what makes this safe to run on the Mac even if
 * state.json and the Desktop ever drift; falling back to state-only when
 * destRoot doesn't exist is what makes the same code safely runnable in a
 * sandbox with no Desktop at all (dry-run, CI, etc.).
 */
export const nextVNumber = (state, destRoot) => {
  const fromState = state.videos.reduce((max, v) => {
    const n = Number(String(v.v).replace(/^V/, ""));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);

  let fromDisk = 0;
  if (destRoot && existsSync(destRoot)) {
    for (const entry of readdirSync(destRoot)) {
      const m = entry.match(/^V(\d+)\s*-/);
      if (m) fromDisk = Math.max(fromDisk, Number(m[1]));
    }
  }

  return Math.max(fromState, fromDisk) + 1;
};

export const formatV = (n) => `V${String(n).padStart(2, "0")}`;

export const addVideo = (state, entry) => {
  state.videos.push(entry);
  return state;
};
