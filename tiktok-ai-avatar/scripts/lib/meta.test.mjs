import { describe, expect, test } from "vitest";

import {
  CAPTION_MAX,
  HASHTAG_MAX,
  buildFacebookReel,
  buildInstagramMedia,
  containerState,
  facebookUploadHeaders,
  pageIdsFromGranularScopes,
  validateReelVideo,
} from "./meta.mjs";

const entry = {
  v: "V17",
  title: "Birth Vs Destiny In 15 Seconds",
  instagramCaption: "Birth vs destiny.\n\nTwo different numbers, and they can contradict.",
  tiktokCaption: "Birth vs destiny — not the same number.",
  hashtags: ["#numerology", "#birthnumber", "#vedicnumerology"],
  utmLinks: {
    instagram: "https://numevix.com/tarot?utm_source=instagram&utm_content=V17",
    youtube: "https://numevix.com/tarot?utm_source=youtube&utm_content=V17",
  },
};

const VIDEO_URL = "https://github.com/devish6/x/releases/download/tmp/V17.mp4";

describe("buildInstagramMedia", () => {
  test("asks for a REEL, pointed at a publicly fetchable url", () => {
    const media = buildInstagramMedia(entry, VIDEO_URL);

    // Instagram FETCHES the file itself — it does not accept an upload — so a
    // local path or a private URL simply fails at their end.
    expect(media.media_type).toBe("REELS");
    expect(media.video_url).toBe(VIDEO_URL);
  });

  test("prefers the Instagram caption over the TikTok one", () => {
    expect(buildInstagramMedia(entry, VIDEO_URL).caption).toContain("Two different numbers");
  });

  /**
   * Instagram renders caption URLs as dead text, so printing one costs
   * readability and buys nothing. The UTM link is still REQUIRED (it is the
   * join key) — it just does not appear.
   */
  test("says link in bio rather than printing a URL", () => {
    const { caption } = buildInstagramMedia(entry, VIDEO_URL);

    expect(caption).toContain("Link in bio");
    expect(caption).not.toMatch(/https?:\/\//);
  });

  test("refuses a video with no Instagram link", () => {
    expect(() => buildInstagramMedia({ ...entry, utmLinks: {} }, VIDEO_URL)).toThrow(/utm/i);
  });

  test("refuses a url Instagram could not reach", () => {
    expect(() => buildInstagramMedia(entry, "/Users/me/Desktop/V17.mp4")).toThrow(/url/i);
    expect(() => buildInstagramMedia(entry, "http://localhost:8080/V17.mp4")).toThrow(/url/i);
  });

  test("stays inside Instagram's caption limit", () => {
    const wordy = { ...entry, instagramCaption: "x".repeat(5000) };

    expect(buildInstagramMedia(wordy, VIDEO_URL).caption.length).toBeLessThanOrEqual(CAPTION_MAX);
  });

  /** Instagram rejects a post outright above 30 hashtags. */
  test("never exceeds the hashtag ceiling", () => {
    const many = { ...entry, hashtags: Array.from({ length: 60 }, (_, i) => `#tag${i}`) };
    const { caption } = buildInstagramMedia(many, VIDEO_URL);

    expect((caption.match(/#/g) ?? []).length).toBeLessThanOrEqual(HASHTAG_MAX);
  });
});

describe("validateReelVideo", () => {
  test("accepts the durations this pipeline produces", () => {
    for (const seconds of [14.25, 23.44, 27.86]) {
      expect(() => validateReelVideo({ seconds, width: 1080, height: 1920 })).not.toThrow();
    }
  });

  test("rejects a clip shorter than Reels allows", () => {
    expect(() => validateReelVideo({ seconds: 2, width: 1080, height: 1920 })).toThrow(/3/);
  });

  test("rejects landscape, which Reels will not take", () => {
    expect(() => validateReelVideo({ seconds: 20, width: 1920, height: 1080 })).toThrow(/vertical/i);
  });
});

describe("containerState", () => {
  /**
   * Instagram creates the container asynchronously and transcodes in the
   * background. Publishing before it is FINISHED fails, so the publish step
   * has to poll rather than assume.
   */
  test("reports when the container is ready to publish", () => {
    expect(containerState({ status_code: "FINISHED" })).toEqual({ done: true, ok: true });
  });

  test("reports a container still being processed", () => {
    expect(containerState({ status_code: "IN_PROGRESS" })).toEqual({ done: false, ok: false });
  });

  test("treats an error as terminal rather than polling forever", () => {
    const state = containerState({ status_code: "ERROR", status: "media download failed" });

    expect(state.done).toBe(true);
    expect(state.ok).toBe(false);
    expect(state.reason).toMatch(/download/);
  });

  test("treats an expired container as terminal", () => {
    expect(containerState({ status_code: "EXPIRED" }).done).toBe(true);
  });
});

describe("buildFacebookReel", () => {
  /**
   * Facebook Reels takes the bytes directly rather than fetching a URL, so
   * unlike Instagram there is nothing to host — but the description still has
   * to carry this video's own link or the traffic is unattributable.
   */
  /**
   * 🔴 Facebook rewrites any posted URL through l.facebook.com/l.php?u=… with
   * an fbclid and hundreds of characters of tracking, which reads as spam.
   * Owner ruling 2026-07-30 after seeing it on the live V17 post.
   */
  test("says link in bio rather than letting Facebook mangle a URL", () => {
    const { description } = buildFacebookReel({
      ...entry,
      utmLinks: { ...entry.utmLinks, facebook: "https://numevix.com/tarot?utm_source=facebook" },
    });

    expect(description).toContain("Link in bio");
    expect(description).not.toMatch(/https?:\/\//);
  });

  test("refuses a video with no Facebook link", () => {
    expect(() => buildFacebookReel(entry)).toThrow(/utm/i);
  });

  test("includes the hashtags", () => {
    const { description } = buildFacebookReel({
      ...entry,
      utmLinks: { facebook: "https://numevix.com/tarot?utm_source=facebook" },
    });

    expect(description).toContain("#numerology");
  });
});

describe("facebookUploadHeaders", () => {
  /**
   * The binary upload phase is not a normal Graph call: it wants an OAuth
   * header rather than a query parameter, plus the byte offset and total size.
   * Getting any of the three wrong fails with an opaque error.
   */
  test("authorizes with an OAuth header, not a query parameter", () => {
    const h = facebookUploadHeaders("PAGE_TOKEN", 1234);

    expect(h.Authorization).toBe("OAuth PAGE_TOKEN");
  });

  test("declares the byte offset and the total file size", () => {
    const h = facebookUploadHeaders("t", 1234);

    expect(h.offset).toBe("0");
    expect(h.file_size).toBe("1234");
  });
});

describe("pageIdsFromGranularScopes", () => {
  /**
   * The real /debug_token payload from the account that hit this, trimmed to
   * the fields that matter. /me/accounts returned [] against this very token.
   */
  const payload = {
    data: {
      app_id: "1035221632741431",
      scopes: ["pages_show_list", "instagram_basic", "instagram_content_publish"],
      granular_scopes: [
        { scope: "pages_show_list", target_ids: ["1239712085890849"] },
        { scope: "instagram_basic", target_ids: ["17841425392432041"] },
        { scope: "pages_read_engagement", target_ids: ["1239712085890849"] },
      ],
    },
  };

  test("recovers the Page id the token is scoped to", () => {
    expect(pageIdsFromGranularScopes(payload)).toEqual(["1239712085890849"]);
  });

  /**
   * pages_show_list is the scope that governs Page enumeration. Reading any
   * other scope's targets would return Instagram ids, which are NOT Pages and
   * would 404 when addressed as one.
   */
  test("reads pages_show_list, not whichever scope comes first", () => {
    const reordered = {
      data: {
        granular_scopes: [
          { scope: "instagram_basic", target_ids: ["17841425392432041"] },
          { scope: "pages_show_list", target_ids: ["1239712085890849"] },
        ],
      },
    };

    expect(pageIdsFromGranularScopes(reordered)).toEqual(["1239712085890849"]);
  });

  test("returns nothing when the token holds no Page at all", () => {
    expect(pageIdsFromGranularScopes({ data: { granular_scopes: [] } })).toEqual([]);
    expect(pageIdsFromGranularScopes({ data: {} })).toEqual([]);
    expect(pageIdsFromGranularScopes({})).toEqual([]);
  });
});
