import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { findIncompleteVideos, videoIsRendered } from "./reconcile.mjs";

/**
 * The gap this closes, observed on 2026-07-30:
 *
 * A run was killed mid-batch. State recorded all four videos as "generated",
 * but V17's folder existed and was EMPTY and V18's folder was never created.
 * The next run then refused to do anything, because the idempotency guard saw
 * a batch for that date and assumed it was complete.
 *
 * The pipeline handles a FAILED RENDER cleanly — the entry is marked "failed"
 * and excluded. It had no handling for a KILLED PROCESS, where state was
 * saved but the work never happened. State lied, and nothing noticed.
 */

const dest = () => mkdtempSync(join(tmpdir(), "numevix-viral-"));

const entry = (v, title, status = "generated") => ({ v, title, status, date: "2026-07-30" });

const withFolder = (root, e, { withMp4 }) => {
  const dir = join(root, `${e.v} - ${e.title}`);
  mkdirSync(dir, { recursive: true });
  if (withMp4) writeFileSync(join(dir, `${e.v} - ${e.title} - v1.mp4`), "not really video");
  return e;
};

describe("videoIsRendered", () => {
  test("is true when the folder holds an mp4", () => {
    const root = dest();
    const e = withFolder(root, entry("V15", "Rate This"), { withMp4: true });

    expect(videoIsRendered(e, root)).toBe(true);
  });

  /** V17's exact case: the folder was created, then the process died. */
  test("is false for a folder with no mp4 in it", () => {
    const root = dest();
    const e = withFolder(root, entry("V17", "Birth Vs Destiny"), { withMp4: false });

    expect(videoIsRendered(e, root)).toBe(false);
  });

  /** V18's exact case: never reached. */
  test("is false when the folder was never created", () => {
    expect(videoIsRendered(entry("V18", "Thursday Runs On Jupiter"), dest())).toBe(false);
  });

  test("ignores stray non-video files", () => {
    const root = dest();
    const e = entry("V19", "Something");
    const dir = join(root, `${e.v} - ${e.title}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "caption.txt"), "text only");

    expect(videoIsRendered(e, root)).toBe(false);
  });
});

describe("findIncompleteVideos", () => {
  test("finds entries that state calls generated but disk does not have", () => {
    const root = dest();
    const state = {
      videos: [
        withFolder(root, entry("V15", "Rate This"), { withMp4: true }),
        withFolder(root, entry("V16", "What I Got Wrong"), { withMp4: true }),
        withFolder(root, entry("V17", "Birth Vs Destiny"), { withMp4: false }),
        entry("V18", "Thursday Runs On Jupiter"),
      ],
    };

    expect(findIncompleteVideos(state, root, "2026-07-30").map((v) => v.v)).toEqual(["V17", "V18"]);
  });

  test("returns nothing when the batch is genuinely complete", () => {
    const root = dest();
    const state = {
      videos: [withFolder(root, entry("V15", "Rate This"), { withMp4: true })],
    };

    expect(findIncompleteVideos(state, root, "2026-07-30")).toEqual([]);
  });

  /** Already-known failures are not the same as an interrupted run. */
  test("ignores entries already marked failed", () => {
    const state = { videos: [entry("V20", "Broken", "failed")] };

    expect(findIncompleteVideos(state, dest(), "2026-07-30")).toEqual([]);
  });

  test("only considers the date being asked about", () => {
    const state = {
      videos: [{ ...entry("V01", "Old"), date: "2026-07-08" }],
    };

    expect(findIncompleteVideos(state, dest(), "2026-07-30")).toEqual([]);
  });

  test("ignores the seeded baseline, which this pipeline never rendered", () => {
    const state = {
      videos: [{ ...entry("V03", "Seeded"), source: "seed-existing" }],
    };

    expect(findIncompleteVideos(state, dest(), "2026-07-30")).toEqual([]);
  });
});
