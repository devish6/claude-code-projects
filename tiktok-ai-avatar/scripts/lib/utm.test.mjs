import { describe, expect, test } from "vitest";

import { PUBLISH_PLATFORMS, utmLinksForVideo, videoUtmLink } from "./utm.mjs";

/**
 * The join key between the two halves of the measurement story.
 *
 * Platform analytics know a video's watch time but nothing about the site.
 * GA4 (live since Slice 6b, 2026-07-30) knows sessions and sign-ups but
 * nothing about which video sent them. utm_content carries the V-number
 * across that gap, so "V15 got 4k views" can become "V15 produced 30
 * sessions and 2 sign-ups". Without it the two data sets never join and the
 * feedback loop has no input.
 */
describe("videoUtmLink", () => {
  test("tags the destination with the video and the platform that sent it", () => {
    const url = new URL(
      videoUtmLink({ base: "https://numevix.com/tarot", platform: "tiktok", videoId: "V15" }),
    );

    expect(url.searchParams.get("utm_source")).toBe("tiktok");
    expect(url.searchParams.get("utm_medium")).toBe("social");
    expect(url.searchParams.get("utm_campaign")).toBe("daily");
    expect(url.searchParams.get("utm_content")).toBe("V15");
  });

  test("keeps the path it was given", () => {
    const url = new URL(
      videoUtmLink({ base: "https://numevix.com/tarot", platform: "tiktok", videoId: "V15" }),
    );

    expect(url.origin + url.pathname).toBe("https://numevix.com/tarot");
  });

  test("preserves a query string the base URL already carried", () => {
    const url = new URL(
      videoUtmLink({
        base: "https://numevix.com/tarot?lang=hi",
        platform: "instagram",
        videoId: "V16",
      }),
    );

    expect(url.searchParams.get("lang")).toBe("hi");
    expect(url.searchParams.get("utm_source")).toBe("instagram");
  });

  test("accepts a campaign other than the daily default", () => {
    const url = new URL(
      videoUtmLink({
        base: "https://numevix.com/tarot",
        platform: "youtube",
        videoId: "V17",
        campaign: "upi-launch",
      }),
    );

    expect(url.searchParams.get("utm_campaign")).toBe("upi-launch");
  });

  test("is deterministic — the same video always yields the same link", () => {
    const args = { base: "https://numevix.com/tarot", platform: "tiktok", videoId: "V15" };

    expect(videoUtmLink(args)).toBe(videoUtmLink(args));
  });

  test("refuses a video id it cannot join on later", () => {
    expect(() =>
      videoUtmLink({ base: "https://numevix.com/tarot", platform: "tiktok", videoId: "" }),
    ).toThrow(/videoId/);
  });
});

describe("utmLinksForVideo", () => {
  test("produces one distinct link per platform we publish to", () => {
    const links = utmLinksForVideo("https://numevix.com/tarot", "V15");

    expect(Object.keys(links).sort()).toEqual([...PUBLISH_PLATFORMS].sort());
    expect(new Set(Object.values(links)).size).toBe(PUBLISH_PLATFORMS.length);
  });

  test("every link carries the same video id, so they aggregate as one video", () => {
    const links = utmLinksForVideo("https://numevix.com/tarot", "V15");

    for (const link of Object.values(links)) {
      expect(new URL(link).searchParams.get("utm_content")).toBe("V15");
    }
  });
});
