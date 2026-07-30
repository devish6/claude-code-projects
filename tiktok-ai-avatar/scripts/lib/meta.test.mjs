import { describe, expect, test } from "vitest";

import {
  CAPTION_MAX,
  HASHTAG_MAX,
  buildInstagramMedia,
  containerState,
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

  test("carries this video's Instagram link, not another platform's", () => {
    const { caption } = buildInstagramMedia(entry, VIDEO_URL);

    expect(caption).toContain(entry.utmLinks.instagram);
    expect(caption).not.toContain("utm_source=youtube");
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
