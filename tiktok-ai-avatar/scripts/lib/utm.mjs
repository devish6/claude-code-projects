/**
 * Campaign tagging for published videos.
 *
 * This is the join key between two data sets that otherwise never meet:
 * platform analytics know a video's watch time but nothing about the site,
 * and GA4 (live since Slice 6b, 2026-07-30) knows sessions and sign-ups but
 * nothing about which video sent them. `utm_content` carries the V-number
 * across that gap, so "V15 got 4k views" can become "V15 produced 30 sessions
 * and 2 sign-ups". Without it the two data sets never join and the feedback
 * loop the marketing plan depends on has no input at all.
 *
 * Deterministic and dependency-free -- the same video always produces the
 * same link, so a link printed in a caption pack today still aggregates with
 * that video's traffic a month later.
 */
export const PUBLISH_PLATFORMS = ["tiktok", "instagram", "youtube", "facebook"];

export const videoUtmLink = ({ base, platform, videoId, campaign = "daily" }) => {
  // A blank videoId silently breaks the join months later, when the traffic
  // exists but can no longer be attributed to anything. Fail at build time.
  if (!videoId.trim()) {
    throw new Error("videoId is required — an untagged video can never be attributed");
  }

  const url = new URL(base);
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", videoId);
  return url.toString();
};

/** One link per surface the video is posted to, all sharing a video id. */
export const utmLinksForVideo = (base, videoId, campaign) =>
  Object.fromEntries(
    PUBLISH_PLATFORMS.map((platform) => [
      platform,
      videoUtmLink({ base, platform, videoId, campaign }),
    ]),
  );
