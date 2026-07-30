import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Reconciles what state CLAIMS against what is actually on disk.
 *
 * The gap this closes, observed 2026-07-30: a run was killed mid-batch. State
 * recorded all four videos as "generated", but V17's folder existed and was
 * empty and V18's was never created. The next run then refused to do anything,
 * because the idempotency guard saw a batch for that date and assumed it was
 * finished.
 *
 * The pipeline already handles a FAILED RENDER well — the entry is marked
 * "failed" and excluded from the generated compositions. What it had no answer
 * for was a KILLED PROCESS, where state was saved but the work never happened.
 * State lied and nothing checked.
 *
 * This must be settled before anything runs on a schedule: unattended means
 * nobody is watching when the process dies.
 */

/** True when the video's folder exists AND holds at least one rendered mp4. */
export const videoIsRendered = (entry, dest) => {
  const dir = join(dest, `${entry.v} - ${entry.title}`);
  if (!existsSync(dir)) return false;

  // A folder alone proves nothing: exportOne creates it before rendering, so
  // an interrupted render leaves an empty one behind.
  return readdirSync(dir).some((f) => f.endsWith(".mp4"));
};

/**
 * Entries for a date that state calls generated but disk cannot account for.
 *
 * @returns the incomplete entries, in state order. Empty means the batch is
 *   genuinely complete and a re-run really would be redundant.
 */
export const findIncompleteVideos = (state, dest, dateISO) =>
  (state.videos ?? []).filter(
    (v) =>
      v.date === dateISO &&
      v.source !== "seed-existing" &&
      // "failed" is a decision already recorded, not an unknown.
      v.status !== "failed" &&
      !videoIsRendered(v, dest),
  );
