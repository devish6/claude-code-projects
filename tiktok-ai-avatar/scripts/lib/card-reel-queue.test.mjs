import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { buildReelEntry, reelVideoId } from "../queue-card-reel.mjs";
import { buildFacebookReel } from "./meta.mjs";
import { buildYouTubeMetadata } from "./youtube.mjs";
import { buildTikTokCaption } from "./tiktok.mjs";

const CARDS = JSON.parse(readFileSync(new URL("../../content/moolank-cards.json", import.meta.url), "utf8"));

const entryFor = (n = 9) =>
  buildReelEntry({
    n,
    card: CARDS[n],
    date: "2026-08-05",
    file: `out/reels/moolank-${n}-reel.mp4`,
  });

describe("card reel queue entry", () => {
  /**
   * ⭐ THIS IS THE POINT OF THE FILE. All three publishers THROW rather than
   * post when a utm link is missing, and two of them read a different key than
   * the one you would guess. Left untested, a malformed entry surfaces at the
   * 12:00 slot as a failed upload against a live API — the most expensive place
   * to learn it. Building the real caption for each platform here is a check
   * that can fail the same way the real operation fails.
   */
  it("satisfies every ET publisher's metadata builder", () => {
    const entry = entryFor(9);

    expect(() => buildFacebookReel(entry)).not.toThrow();
    expect(() => buildYouTubeMetadata(entry, { privacy: "public" })).not.toThrow();
    expect(() => buildTikTokCaption(entry)).not.toThrow();
  });

  it("carries a per-platform utm link tagged with its own video id", () => {
    const entry = entryFor(9);
    expect(entry.v).toBe("M9R");
    for (const p of ["youtube", "facebook", "tiktok"]) {
      expect(entry.utmLinks[p]).toContain(`utm_source=${p}`);
      expect(entry.utmLinks[p]).toContain(`utm_content=${reelVideoId(9)}`);
    }
  });

  /**
   * 🔴 The duplicate guard that keeps Instagram on ONE publisher. If this ever
   * goes green with instagram present, publish-next will post the reel that
   * publish-card.mjs already posted, and the two ledgers will not notice.
   */
  it("opts out of instagram, which publish-card.mjs owns", () => {
    expect(entryFor(9).platforms).toEqual(["youtube", "facebook", "tiktok"]);
    expect(entryFor(9).platforms).not.toContain("instagram");
  });

  it("is visible to publish-next: generated, and not a seed row", () => {
    const entry = entryFor(9);
    expect(entry.status).toBe("generated");
    expect(entry.source).not.toBe("seed-existing");
  });

  it("points at the rendered reel rather than the old Viral folder", () => {
    expect(entryFor(7).file).toBe("out/reels/moolank-7-reel.mp4");
  });
});
