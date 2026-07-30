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

const MIN_SECONDS = 3;
const MAX_SECONDS = 900;

/**
 * Builds the media-container request for one pipeline entry.
 *
 * @param {object} entry a video from content/daily-state.json
 * @param {string} videoUrl a publicly fetchable https URL
 */
export const buildInstagramMedia = (entry, videoUrl) => {
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

  const caption = [body, "", link, "", tags.join(" ")].join("\n").slice(0, CAPTION_MAX);

  return { media_type: "REELS", video_url: videoUrl, caption };
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
