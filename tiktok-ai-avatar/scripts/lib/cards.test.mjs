import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  CAPTION_MAX,
  HASHTAG_MAX,
  buildCardCaption,
  cardHashtags,
  commentCta,
  spokenDates,
  validateCardImage,
} from "./cards.mjs";

const CARDS = JSON.parse(readFileSync(new URL("../../content/moolank-cards.json", import.meta.url)));
const NUMBERS = Object.keys(CARDS).map(Number);

describe("card captions", () => {
  it("opens on the number and every qualifying date", () => {
    // ⭐ The rule V28 broke. Confirmed three times against accounts at 41K-55K
    // likes, so it is settled practice rather than a preference.
    const expected = {
      1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30],
      4: [4, 13, 22, 31], 5: [5, 14, 23], 6: [6, 15, 24],
      7: [7, 16, 25], 8: [8, 17, 26], 9: [9, 18, 27],
    };
    for (const n of NUMBERS) {
      const first = buildCardCaption(CARDS[n]).split("\n")[0];
      const found = first.match(/\d+/g).map(Number);
      // The leading number is the Moolank itself, the rest are the dates.
      expect(found[0], `moolank ${n}`).toBe(n);
      expect(found.slice(1), `dates for ${n}`).toEqual(expected[n]);
    }
  });

  it("joins the last date with 'or' without dropping any", () => {
    expect(spokenDates("8th, 17th, 26th")).toBe("8th, 17th or 26th");
    expect(spokenDates("4th, 13th, 22nd, 31st")).toBe("4th, 13th, 22nd or 31st");
    // A single date has no comma to convert and must survive untouched.
    expect(spokenDates("5th")).toBe("5th");
  });

  it("asks for a comment that names the number", () => {
    for (const n of NUMBERS) {
      expect(buildCardCaption(CARDS[n])).toContain(commentCta(n));
    }
  });

  it("keeps the promotion to a footer, never inside the value", () => {
    for (const n of NUMBERS) {
      const caption = buildCardCaption(CARDS[n]);
      const lines = caption.split("\n").filter(Boolean);
      const linkAt = lines.findIndex((l) => l.includes("Link in bio"));
      // It must appear, and it must come after the save/share ask — otherwise
      // the post opens on a pitch, which is the "it looks like an ad" failure.
      expect(linkAt).toBeGreaterThan(-1);
      expect(lines.slice(0, linkAt).join(" ")).toMatch(/Save it/);
    }
  });

  it("never puts a bare url in the caption", () => {
    // Instagram renders urls as dead text and Facebook rewrites them through
    // l.facebook.com with several hundred characters of tracking. Both read as
    // spam and neither is clickable, so the link lives in the bio.
    for (const n of NUMBERS) {
      expect(buildCardCaption(CARDS[n])).not.toMatch(/https?:\/\//);
    }
  });

  it("stays inside Instagram's caption and hashtag limits", () => {
    for (const n of NUMBERS) {
      expect(buildCardCaption(CARDS[n]).length).toBeLessThanOrEqual(CAPTION_MAX);
      expect(cardHashtags(CARDS[n]).length).toBeLessThanOrEqual(HASHTAG_MAX);
    }
  });

  it("tags the specific number, not only the broad topic", () => {
    for (const n of NUMBERS) {
      expect(cardHashtags(CARDS[n])).toContain(`#moolank${n}`);
    }
  });

  it("refuses a card whose number is missing", () => {
    expect(() => buildCardCaption({})).toThrow(/number/);
  });
});

describe("card image validation", () => {
  it("accepts the 1080x1350 jpeg the renderer produces", () => {
    expect(() =>
      validateCardImage({ width: 1080, height: 1350, path: "/tmp/moolank-8.jpg" }),
    ).not.toThrow();
  });

  it("rejects a PNG", () => {
    // 🔴 The real failure mode: Instagram's error names the URL, not the format.
    expect(() =>
      validateCardImage({ width: 1080, height: 1350, path: "/tmp/moolank-8.png" }),
    ).toThrow(/JPEG/);
  });

  it("rejects anything taller than 4:5", () => {
    // A 9:16 reel frame posted as a feed image is the likely mistake here.
    expect(() =>
      validateCardImage({ width: 1080, height: 1920, path: "/tmp/x.jpg" }),
    ).toThrow(/aspect ratio/);
  });
});
