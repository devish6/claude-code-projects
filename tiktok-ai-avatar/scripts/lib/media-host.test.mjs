import { describe, expect, test } from "vitest";

import { assetUrl, safeAssetName } from "./media-host.mjs";

/**
 * Instagram fetches the video itself, so a rendered file has to be publicly
 * reachable for a few minutes. GitHub release assets do that for free, are
 * already authenticated via gh, and — unlike committing the mp4 — leave no
 * trace in git history on a repo that is public and Pages-served.
 */
describe("safeAssetName", () => {
  /**
   * Export filenames contain spaces ("V17 - Birth Vs Destiny - v1.mp4").
   * GitHub rewrites spaces in asset names, so the URL you predicted is not the
   * URL you get. Naming the asset ourselves keeps the two in step.
   */
  test("produces a url-safe name from the V number", () => {
    expect(safeAssetName({ v: "V17" })).toBe("V17.mp4");
  });

  test("contains no character that would be rewritten in a url", () => {
    expect(safeAssetName({ v: "V17" })).toMatch(/^[A-Za-z0-9._-]+$/);
  });
});

describe("assetUrl", () => {
  test("predicts the public download url for an asset", () => {
    expect(assetUrl("devish6/claude-code-projects", "media-V17", "V17.mp4")).toBe(
      "https://github.com/devish6/claude-code-projects/releases/download/media-V17/V17.mp4",
    );
  });

  test("is https, which Instagram requires", () => {
    expect(assetUrl("a/b", "t", "f.mp4").startsWith("https://")).toBe(true);
  });
});
