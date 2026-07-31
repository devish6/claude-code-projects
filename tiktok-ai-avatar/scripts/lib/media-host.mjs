import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Temporary public hosting for a rendered video.
 *
 * Instagram does not accept an upload — its servers FETCH the file from a URL
 * you give them. So the mp4 has to be publicly reachable for the few minutes
 * it takes Instagram to download and transcode it.
 *
 * GitHub release assets do this for free: gh is already authenticated, the
 * repo is public so assets need no token to download, and — unlike committing
 * the mp4 — a release asset leaves NO trace in git history. That matters on a
 * repo that is public and Pages-served, where a committed 7MB video would be
 * permanent.
 *
 * 🔴 Only ever host generated viral videos. The owner's personal talking-head
 * footage is gitignored precisely because this repo is public; putting it on a
 * release would publish exactly what that rule exists to prevent.
 */
const REPO = "devish6/claude-code-projects";

/**
 * Export filenames contain spaces ("V17 - Birth Vs Destiny - v1.mp4"). GitHub
 * rewrites those in asset names, so the URL you predicted would not be the URL
 * you get — name the asset ourselves and the two stay in step.
 */
export const safeAssetName = (entry) => `${entry.v}.mp4`;

export const assetUrl = (repo, tag, name) =>
  `https://github.com/${repo}/releases/download/${tag}/${name}`;

const gh = (args) =>
  execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/**
 * Publishes the file and returns its public URL.
 *
 * @returns {{ url: string, tag: string, name: string }} pass back to
 *   unhostVideo once the platform has fetched it.
 */
export const hostVideo = (entry, filePath) => hostAsset(entry, filePath, safeAssetName(entry));

/**
 * Stages ANY file in the same per-video release, under a caller-chosen name.
 *
 * Instagram fetches the cover image the same way it fetches the video — by URL — so the
 * cover needs hosting too. Both live under one tag on purpose: `unhostVideo` deletes the
 * whole release, so a single cleanup removes every staged asset and there is no way to
 * tidy the video and leave the cover behind on a public repo.
 */
export const hostAsset = (entry, filePath, name) => {
  const tag = `media-${entry.v}`;

  // Stage under a clean filename so the asset name is predictable.
  const staged = join(mkdtempSync(join(tmpdir(), "numevix-media-")), name);
  copyFileSync(filePath, staged);

  try {
    gh(["release", "view", tag, "--repo", REPO]);
  } catch {
    gh([
      "release",
      "create",
      tag,
      "--repo",
      REPO,
      "--title",
      `Media staging — ${entry.v}`,
      "--notes",
      "Temporary hosting so Instagram can fetch this video. Deleted after publishing.",
    ]);
  }

  gh(["release", "upload", tag, staged, "--repo", REPO, "--clobber"]);

  return { url: assetUrl(REPO, tag, name), tag, name };
};

/** Removes the staged copy once the platform has it. */
export const unhostVideo = ({ tag }) => {
  try {
    gh(["release", "delete", tag, "--repo", REPO, "--yes", "--cleanup-tag"]);
    return true;
  } catch {
    // Not fatal: the video is already published by this point, and a leftover
    // staging release is visible but harmless. Report it rather than failing.
    return false;
  }
};
