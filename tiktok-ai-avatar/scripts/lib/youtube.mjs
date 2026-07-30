/**
 * YouTube Shorts publishing — metadata, quota and token rules.
 *
 * Kept separate from the network code in publish-youtube.mjs so the parts that
 * decide WHAT gets published are testable without touching Google.
 *
 * Phase 2 of the growth roadmap. YouTube goes first because its API is the
 * most permissive of the four platforms: no content audit, no public-URL
 * hosting requirement, and a quota that comfortably covers a daily batch.
 */

/** videos.insert costs this much against a 10,000 unit/day default quota. */
export const QUOTA_PER_UPLOAD = 1600;

/** So six uploads a day, which is more than the pipeline produces. */
export const DAILY_UPLOAD_LIMIT = Math.floor(10_000 / QUOTA_PER_UPLOAD);

const TITLE_MAX = 100;
const TAGS_TOTAL_MAX = 500;
const VALID_PRIVACY = ["private", "unlisted", "public"];

/**
 * Refresh this far before actual expiry. An upload takes longer than a few
 * seconds, so a token that is "still valid" at the start can expire mid-
 * transfer and fail the whole insert.
 */
const REFRESH_MARGIN_MS = 60_000;

/**
 * Builds the videos.insert body for one pipeline entry.
 *
 * @param {object} entry a video from content/daily-state.json
 * @param {{ privacy?: string }} [opts]
 */
export const buildYouTubeMetadata = (entry, { privacy = "private" } = {}) => {
  if (!VALID_PRIVACY.includes(privacy)) {
    throw new Error(`privacy must be one of ${VALID_PRIVACY.join(", ")}, got "${privacy}"`);
  }

  const link = entry.utmLinks?.youtube;
  if (!link) {
    // The description is the only place a YouTube viewer can get a link. An
    // untagged upload produces traffic that can never be attributed, and there
    // is no way to backfill it afterwards.
    throw new Error(`${entry.v}: no youtube utm link — refusing to publish untracked`);
  }

  // "#Shorts" is part of how YouTube classifies a vertical short.
  const title = `${entry.title} #Shorts`.slice(0, TITLE_MAX);

  const description = [
    entry.tiktokCaption ?? entry.title,
    "",
    `Your free numerology reading: ${link}`,
    "",
    (entry.hashtags ?? []).join(" "),
  ].join("\n");

  // YouTube caps the COMBINED length of tags, not each one, and silently
  // rejects the insert if it is exceeded.
  const tags = [];
  let budget = TAGS_TOTAL_MAX;
  for (const raw of entry.hashtags ?? []) {
    const tag = raw.replace(/^#/, "");
    const cost = tag.length + 1; // the joining comma
    if (cost > budget) break;
    tags.push(tag);
    budget -= cost;
  }

  return {
    snippet: {
      title,
      description,
      tags,
      // 22 = "People & Blogs", the safest general category.
      categoryId: "22",
    },
    status: {
      privacyStatus: privacy,
      // Required. Omitting it makes the API reject the insert outright.
      selfDeclaredMadeForKids: false,
    },
  };
};

/** How many uploads today's quota still allows. */
export const remainingUploadsToday = (log, dateISO) => {
  const used = (log ?? []).filter((row) => row.date === dateISO).length;
  return Math.max(0, DAILY_UPLOAD_LIMIT - used);
};

/** True when the access token is missing, expired, or about to expire. */
export const tokenIsExpired = (token, now = new Date()) => {
  if (!token?.expiry) return true;
  return new Date(token.expiry).getTime() - REFRESH_MARGIN_MS <= now.getTime();
};

/**
 * The upload-log row for a V, if it has already been published.
 *
 * videos.insert always creates a NEW video — there is no upsert and no way to
 * change an existing video's privacy with the upload-only scope. So re-running
 * an upload silently produces a duplicate on the channel rather than editing
 * the original.
 */
export const alreadyUploaded = (log, v) => (log ?? []).find((row) => row.v === v);
