import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { buildReelEntry, reelVideoId } from "../queue-card-reel.mjs";
import { buildFacebookReel, LINK_IN_BIO } from "./meta.mjs";
import { buildYouTubeMetadata } from "./youtube.mjs";
import { buildTikTokCaption } from "./tiktok.mjs";
import { buildReelCaptionBody } from "./cards.mjs";

const CARDS = JSON.parse(readFileSync(new URL("../../content/moolank-cards.json", import.meta.url), "utf8"));
const STATE = JSON.parse(readFileSync(new URL("../../content/daily-state.json", import.meta.url), "utf8"));

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const occurrences = (haystack, needle) => haystack.split(needle).length - 1;

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

  /**
   * 🔴🔴 THE LEDGER HAS TO SAY WHAT THE POST WAS ABOUT, or the 21-day
   * no-repeat window in angles.mjs reads every angle as never-used and can
   * never fire. `angleId` appeared nowhere outside angles.mjs and its own
   * tests, so "never reuse a flopped idea" was enforced by whoever happened to
   * be reading.
   *
   * A card reel is "one number, its ruling planet and traits" — that IS
   * `trait-per-number`, which the registry marks `rejected` on our own
   * numbers (TikTok ~205 views, Instagram 122-213 reach). Stamping it is not
   * an endorsement; it is the ledger telling the truth about what went out.
   */
  it("records the angle it actually is, so the no-repeat window can see it", () => {
    expect(entryFor(9).angleId).toBe("trait-per-number");
  });
});

/**
 * ⭐⭐ THE FIELD IS A BODY, NOT A FINISHED CAPTION — and nothing said so.
 *
 * `entry.tiktokCaption` is what the three ET publishers treat as the body they
 * wrap: each of them appends its own footer and its own hashtag line on top
 * (buildTikTokCaption, buildFacebookReel, buildYouTubeMetadata). The queue
 * stored a FINISHED caption there — buildReelCaption's output, footer and
 * hashtags included — so M9R went out on 2026-08-05 with "Link in bio 🔗" and
 * the whole tag block printed twice on all three platforms.
 *
 * Instagram never showed it, because publish-card.mjs calls buildReelCaption
 * live and posts it verbatim. So the only check that could have caught this is
 * one that builds what each publisher actually SENDS, and counts.
 */
describe("the caption the ET publishers actually send", () => {
  it("says Link in bio exactly once on TikTok and Facebook", () => {
    for (const n of NUMBERS) {
      const entry = entryFor(n);
      expect(occurrences(buildTikTokCaption(entry), LINK_IN_BIO)).toBe(1);
      expect(occurrences(buildFacebookReel(entry).description, LINK_IN_BIO)).toBe(1);
    }
  });

  /**
   * 🔴 YouTube is the one platform whose description LINKIFIES, so it carries
   * the real UTM url and must never tell a viewer to go look in a bio.
   */
  it("never says Link in bio on YouTube, which has a clickable url", () => {
    for (const n of NUMBERS) {
      const { snippet } = buildYouTubeMetadata(entryFor(n), { privacy: "public" });
      expect(snippet.description).not.toContain(LINK_IN_BIO);
      expect(snippet.description).toContain("https://numevix.com/");
    }
  });

  it("prints the hashtag block exactly once on all three", () => {
    for (const n of NUMBERS) {
      const entry = entryFor(n);
      const tag = `#moolank${n}`;
      expect(occurrences(buildTikTokCaption(entry), tag)).toBe(1);
      expect(occurrences(buildFacebookReel(entry).description, tag)).toBe(1);
      expect(occurrences(buildYouTubeMetadata(entry, { privacy: "public" }).snippet.description, tag)).toBe(1);
    }
  });
});

/**
 * ⭐⭐⭐ THE DATA CAN GO STALE WHILE THE CODE IS RIGHT, AND THAT IS WHAT HAPPENED.
 *
 * queue-card-reel.mjs called the correct builder — it just ran at 14:08 on
 * 2026-08-05, and the search-vocabulary rewrite landed at 15:30 in e8e08c2.
 * That commit only ADDED a row to daily-state.json; it never rewrote the nine
 * already sitting there. So the reels rendered with "Numerology birth number 8
 * — your day number…" burned into frame, while YouTube, Facebook and TikTok
 * kept captioning them "Moolank 8 — Born on the 8th…".
 *
 * A unit test over the builder cannot see that: both sides call the same
 * function. Only a test that reads the STORED rows can, so this one does.
 * It fails the next time a caption is rewritten without re-queueing.
 */
describe("content/daily-state.json is in sync with the current builder", () => {
  const queued = STATE.videos.filter((v) => /^M[1-9]R$/.test(v.v));

  it("has every card reel queued", () => {
    expect(queued).toHaveLength(9);
  });

  it("stores the CURRENT caption body for each reel", () => {
    for (const entry of queued) {
      const n = Number(entry.v.match(/^M([1-9])R$/)[1]);
      expect(entry.tiktokCaption).toBe(buildReelCaptionBody(CARDS[n]));
      expect(entry.instagramCaption).toBe(buildReelCaptionBody(CARDS[n]));
    }
  });

  it("leads on the search vocabulary, not the brand term", () => {
    for (const entry of queued) {
      const n = Number(entry.v.match(/^M([1-9])R$/)[1]);
      expect(entry.tiktokCaption.split("\n")[0]).toContain(`Numerology birth number ${n}`);
    }
  });
});
