import { describe, expect, test } from "vitest";

import {
  DAILY_UPLOAD_LIMIT,
  QUOTA_PER_UPLOAD,
  alreadyUploaded,
  buildYouTubeMetadata,
  remainingUploadsToday,
  tokenIsExpired,
} from "./youtube.mjs";

const entry = {
  v: "V15",
  title: "Birth Vs Destiny In 15 Seconds",
  tiktokCaption: "Birth vs destiny, explained in 15 seconds — they are not the same number.",
  instagramCaption: "Birth vs destiny.\n\nTwo different numbers.",
  hashtags: ["#numerology", "#birthnumber", "#vedicnumerology"],
  utmLinks: {
    youtube:
      "https://numevix.com/tarot?utm_source=youtube&utm_medium=social&utm_campaign=daily&utm_content=V15",
    tiktok: "https://numevix.com/tarot?utm_source=tiktok&utm_content=V15",
  },
};

describe("buildYouTubeMetadata", () => {
  test("titles the video and stays inside YouTube's 100-character limit", () => {
    const meta = buildYouTubeMetadata(entry);

    expect(meta.snippet.title.length).toBeLessThanOrEqual(100);
    expect(meta.snippet.title).toContain("Birth Vs Destiny");
  });

  test("truncates an over-long title rather than letting the API reject it", () => {
    const meta = buildYouTubeMetadata({ ...entry, title: "x".repeat(200) });

    expect(meta.snippet.title.length).toBeLessThanOrEqual(100);
  });

  /** Shorts are classified partly on the hashtag, and these are all vertical. */
  test("marks the upload as a Short", () => {
    const meta = buildYouTubeMetadata(entry);

    expect(`${meta.snippet.title} ${meta.snippet.description}`).toContain("#Shorts");
  });

  /**
   * The description is the ONLY place a YouTube viewer can get a link, so it
   * must carry the video's own UTM. A bare numevix.com link there makes the
   * traffic permanently unattributable.
   */
  test("carries this video's YouTube UTM link, not another platform's", () => {
    const meta = buildYouTubeMetadata(entry);

    expect(meta.snippet.description).toContain(entry.utmLinks.youtube);
    expect(meta.snippet.description).not.toContain("utm_source=tiktok");
  });

  test("refuses to publish a video with no UTM link", () => {
    expect(() => buildYouTubeMetadata({ ...entry, utmLinks: undefined })).toThrow(/utm/i);
  });

  test("turns hashtags into tags, without the hash", () => {
    const meta = buildYouTubeMetadata(entry);

    expect(meta.snippet.tags).toContain("numerology");
    expect(meta.snippet.tags.join("")).not.toContain("#");
  });

  test("keeps tags inside YouTube's 500-character total", () => {
    const meta = buildYouTubeMetadata({
      ...entry,
      hashtags: Array.from({ length: 80 }, (_, i) => `#averyverylongtagname${i}`),
    });

    expect(meta.snippet.tags.join(",").length).toBeLessThanOrEqual(500);
  });

  /**
   * Defaults to private. A first automated upload going straight to public on
   * an untested pipeline is the kind of mistake that is visible to an audience
   * before it is visible to us.
   */
  test("defaults to private, and honours an explicit privacy setting", () => {
    expect(buildYouTubeMetadata(entry).status.privacyStatus).toBe("private");
    expect(buildYouTubeMetadata(entry, { privacy: "public" }).status.privacyStatus).toBe("public");
  });

  test("rejects a privacy value YouTube does not accept", () => {
    expect(() => buildYouTubeMetadata(entry, { privacy: "everyone" })).toThrow(/privacy/i);
  });

  /** A required field. Omitting it makes the API reject the whole insert. */
  test("declares the made-for-kids status", () => {
    expect(buildYouTubeMetadata(entry).status.selfDeclaredMadeForKids).toBe(false);
  });
});

describe("remainingUploadsToday", () => {
  test("allows the full daily allowance when nothing has been uploaded", () => {
    expect(remainingUploadsToday([], "2026-08-01")).toBe(DAILY_UPLOAD_LIMIT);
  });

  test("counts only today's uploads", () => {
    const log = [
      { date: "2026-08-01", v: "V01" },
      { date: "2026-07-31", v: "V00" },
    ];

    expect(remainingUploadsToday(log, "2026-08-01")).toBe(DAILY_UPLOAD_LIMIT - 1);
  });

  /**
   * videos.insert costs 1600 units against a 10,000/day quota, so the ceiling
   * is 6. Exceeding it fails every remaining upload that day, which would
   * silently drop a whole batch.
   */
  test("never goes negative, and matches the published quota arithmetic", () => {
    const log = Array.from({ length: 20 }, (_, i) => ({ date: "2026-08-01", v: `V${i}` }));

    expect(remainingUploadsToday(log, "2026-08-01")).toBe(0);
    expect(DAILY_UPLOAD_LIMIT).toBe(Math.floor(10_000 / QUOTA_PER_UPLOAD));
  });
});

describe("tokenIsExpired", () => {
  test("treats a token past its expiry as expired", () => {
    expect(tokenIsExpired({ expiry: "2026-08-01T00:00:00Z" }, new Date("2026-08-01T00:01:00Z"))).toBe(
      true,
    );
  });

  test("refreshes early rather than mid-upload", () => {
    // Still valid for 30s, but an upload takes longer than that.
    const almost = new Date("2026-08-01T00:00:30Z");

    expect(tokenIsExpired({ expiry: "2026-08-01T00:01:00Z" }, almost)).toBe(true);
  });

  test("treats a missing token as expired rather than crashing", () => {
    expect(tokenIsExpired(undefined, new Date())).toBe(true);
  });
});

describe("alreadyUploaded", () => {
  /**
   * videos.insert always creates a NEW video — there is no upsert. Re-running
   * the same V would put a second copy on the channel, which on an account
   * whose predecessor was withheld for duplicate content is the worst
   * available mistake.
   */
  test("recognises a video that has already been uploaded", () => {
    const log = [{ date: "2026-07-30", v: "V15", videoId: "abc" }];

    expect(alreadyUploaded(log, "V15")).toEqual({ date: "2026-07-30", v: "V15", videoId: "abc" });
  });

  test("returns nothing for a video that has not", () => {
    expect(alreadyUploaded([{ v: "V15" }], "V16")).toBeUndefined();
  });

  test("treats an empty log as nothing uploaded", () => {
    expect(alreadyUploaded(undefined, "V15")).toBeUndefined();
  });
});
