/**
 * Instagram Reels publishing — captions, validation and container state.
 *
 * Phase 3. The shape of this differs from YouTube in one decisive way:
 * **Instagram FETCHES the video from a public URL.** It does not accept an
 * upload. So a rendered file on the Desktop has to be reachable from the
 * internet before Instagram will look at it — see media-host.mjs, which
 * parks it on a GitHub release and removes it afterwards.
 *
 * Publishing is also two-phase and asynchronous: create a container, wait for
 * Instagram to transcode it, then publish the container. Publishing early
 * fails, so the caller polls.
 */

/** Instagram truncates captions past this. */
export const CAPTION_MAX = 2200;

/** More than this and Instagram rejects the post outright. */
export const HASHTAG_MAX = 30;

/**
 * What stands in for the URL on platforms that will not make one clickable.
 *
 * 🔴 Facebook rewrites every posted URL through `l.facebook.com/l.php?u=…`
 * with an fbclid and several hundred characters of tracking, which reads as
 * spam. Instagram simply renders URLs as dead text. On both, printing the link
 * costs readability and buys nothing.
 *
 * ⚠️ The UTM link is still REQUIRED and still validated — it is the join key
 * for per-video attribution — it just no longer goes in the caption. The
 * consequence is real and worth remembering: **clicks now arrive through one
 * static bio link, so they can no longer be attributed to a specific video.**
 * Restoring that needs a link-in-bio page carrying the per-video UTM, not a
 * change here.
 */
export const LINK_IN_BIO = "Link in bio 🔗";

const MIN_SECONDS = 3;
const MAX_SECONDS = 900;

/**
 * Builds the media-container request for one pipeline entry.
 *
 * @param {object} entry a video from content/daily-state.json
 * @param {string} videoUrl a publicly fetchable https URL
 */
export const buildInstagramMedia = (entry, videoUrl, coverUrl) => {
  const link = entry.utmLinks?.instagram;
  if (!link) {
    throw new Error(`${entry.v}: no instagram utm link — refusing to publish untracked`);
  }

  // Instagram's servers do the fetching, so anything they cannot reach from
  // the public internet fails at their end with an unhelpful error.
  let parsed;
  try {
    parsed = new URL(videoUrl);
  } catch {
    throw new Error(`video url must be an absolute https url, got "${videoUrl}"`);
  }
  if (parsed.protocol !== "https:" || /^(localhost|127\.|0\.0\.0\.0)/.test(parsed.hostname)) {
    throw new Error(`video url must be publicly reachable over https, got "${videoUrl}"`);
  }

  const body = entry.instagramCaption ?? entry.tiktokCaption ?? entry.title;
  const tags = (entry.hashtags ?? []).slice(0, HASHTAG_MAX);

  const caption = [body, "", LINK_IN_BIO, "", tags.join(" ")].join("\n").slice(0, CAPTION_MAX);

  const media = { media_type: "REELS", video_url: videoUrl, caption };

  // A cover.png has been rendered beside every mp4 since V01 and Instagram was never
  // sent one, so every Reel showed a frame Instagram picked — usually whatever sits at
  // 0ms, which on a video that fades up from black is literally a black frame. The cover
  // is the entire thumbnail in the grid and in Explore, so this is not cosmetic.
  //
  // Instagram fetches this URL itself, exactly like the video, so it must be publicly
  // reachable https. Optional: if there is no cover we simply omit it and get the old
  // behaviour rather than failing the post.
  if (coverUrl) media.cover_url = coverUrl;

  return media;
};

/** Rejects a file Reels would refuse, before spending an upload on it. */
export const validateReelVideo = ({ seconds, width, height }) => {
  if (seconds < MIN_SECONDS) {
    throw new Error(`Reels requires at least ${MIN_SECONDS}s, this is ${seconds}s`);
  }
  if (seconds > MAX_SECONDS) {
    throw new Error(`Reels allows at most ${MAX_SECONDS}s, this is ${seconds}s`);
  }
  if (height <= width) {
    throw new Error(`Reels needs a vertical video, this is ${width}x${height}`);
  }
};

/**
 * Interprets a container's status.
 *
 * Instagram transcodes in the background, so a container is not publishable
 * the moment it is created. ERROR and EXPIRED are terminal — polling through
 * them would spin until the timeout for no reason.
 */
export const containerState = (payload) => {
  const code = payload?.status_code;

  if (code === "FINISHED") return { done: true, ok: true };
  if (code === "ERROR" || code === "EXPIRED") {
    return { done: true, ok: false, reason: payload.status ?? code };
  }
  return { done: false, ok: false };
};

/**
 * The Page ids a token is actually scoped to, read from /debug_token.
 *
 * 🪤 `/me/accounts` can return an EMPTY list for a token that demonstrably
 * holds the Page — observed on this account 2026-07-30, where the Page was
 * ticked in Business Integrations and the debugger showed
 * `pages_show_list → 1239712085890849 : Numevix`, yet the edge stayed `[]`.
 * Re-consenting cannot fix it because nothing is actually wrong with the grant.
 *
 * Granular scopes are the authoritative record of what a token may touch, so
 * when the convenience edge comes up empty we read them instead and address
 * the Page directly. `pages_show_list` is the scope to trust: it is the one
 * that governs Page enumeration, and it is what /me/accounts itself checks.
 */
export const pageIdsFromGranularScopes = (payload) => {
  const scopes = payload?.data?.granular_scopes ?? [];
  const pages = scopes.find((s) => s.scope === "pages_show_list");
  return pages?.target_ids ?? [];
};

// ── Facebook Reels ──────────────────────────────────────────────────────────
//
// Same Meta app and the same Page token as Instagram, but a different
// transport: Facebook takes the BYTES directly (start → upload → finish),
// where Instagram fetches a URL. So Facebook needs no public hosting at all.

/**
 * The description for a Facebook Reel.
 *
 * Facebook needs no hosted copy, but the link still has to be this video's
 * own — a Reel posted with another platform's UTM would credit the wrong
 * source, which is worse than no tag at all because it looks like data.
 */
export const buildFacebookReel = (entry) => {
  const link = entry.utmLinks?.facebook;
  if (!link) {
    throw new Error(`${entry.v}: no facebook utm link — refusing to publish untracked`);
  }

  const body = entry.instagramCaption ?? entry.tiktokCaption ?? entry.title;
  const description = [body, "", LINK_IN_BIO, "", (entry.hashtags ?? []).join(" ")].join("\n");

  return { description };
};

/**
 * Headers for the binary upload phase.
 *
 * This is not a normal Graph call: it wants an `OAuth <token>` Authorization
 * header rather than an access_token parameter, plus the byte offset and the
 * total file size. Any of the three missing fails with an opaque error.
 */
export const facebookUploadHeaders = (pageToken, fileSize, offset = 0) => ({
  Authorization: `OAuth ${pageToken}`,
  offset: String(offset),
  file_size: String(fileSize),
});
