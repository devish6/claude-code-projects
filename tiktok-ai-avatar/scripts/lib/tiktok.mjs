/**
 * Pure helpers for the TikTok Content Posting API.
 *
 * Everything here is decision-making — building the authorization URL, sizing
 * the upload, reading a status payload. The I/O lives in publish-tiktok.mjs so
 * these stay testable without a network or a token.
 */

import { LINK_IN_BIO } from "./meta.mjs";

/** TikTok requires a single chunk below this; above it, chunked upload. */
export const SINGLE_CHUNK_MAX = 64 * 1024 * 1024;

/** Reels-equivalent bounds for TikTok. */
const MIN_SECONDS = 3;
const MAX_SECONDS = 600;

/**
 * Where the browser is sent to authorize.
 *
 * `state` is not decoration: the callback page is public and static, so the
 * only thing proving the code that comes back belongs to the request we
 * started is that this value survives the round trip.
 */
export const authorizeUrl = ({ clientKey, redirectUri, state }) => {
  if (!clientKey) throw new Error("clientKey is required");
  if (!redirectUri) throw new Error("redirectUri is required");
  if (!state) throw new Error("state is required — it is the CSRF check, not optional");

  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("scope", "user.info.basic,video.upload");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
};

/**
 * How TikTok wants this file described at init.
 *
 * 🪤 The three numbers must agree with each other AND with the bytes actually
 * sent, or init succeeds and the upload fails later with an opaque error. A
 * video under the single-chunk ceiling must declare exactly one chunk whose
 * size is the whole file — NOT a smaller chunk size with a count.
 */
export const chunkPlan = (videoSize) => {
  if (!Number.isInteger(videoSize) || videoSize <= 0) {
    throw new Error(`video_size must be a positive integer, got ${videoSize}`);
  }
  if (videoSize > SINGLE_CHUNK_MAX) {
    throw new Error(
      `${(videoSize / 1e6).toFixed(1)} MB exceeds the ${SINGLE_CHUNK_MAX / 1e6} MB single-chunk ` +
        "limit. This pipeline's videos are far below it, so this is a signal something is " +
        "wrong with the render rather than a case to support.",
    );
  }
  return { video_size: videoSize, chunk_size: videoSize, total_chunk_count: 1 };
};

/**
 * Headers for the binary PUT.
 *
 * Content-Range is inclusive of the last byte, so the end index is size - 1.
 * Off-by-one here fails as a size mismatch, which reads like a corrupt file.
 */
export const uploadHeaders = (size) => ({
  "Content-Type": "video/mp4",
  "Content-Length": String(size),
  "Content-Range": `bytes 0-${size - 1}/${size}`,
});

/** Rejects a file TikTok would refuse, before spending an upload on it. */
export const validateTikTokVideo = ({ seconds, width, height }) => {
  if (seconds < MIN_SECONDS) {
    throw new Error(`TikTok requires at least ${MIN_SECONDS}s, this is ${seconds}s`);
  }
  if (seconds > MAX_SECONDS) {
    throw new Error(`TikTok allows at most ${MAX_SECONDS}s, this is ${seconds}s`);
  }
  if (height <= width) {
    throw new Error(`TikTok needs a vertical video, this is ${width}x${height}`);
  }
};

/**
 * Interprets a publish-status payload.
 *
 * ⭐ `SEND_TO_USER_INBOX` is SUCCESS for our flow, not an intermediate state —
 * an inbox upload is finished the moment it reaches the drafts. Treating it as
 * "still processing" would poll until timeout on a video that already arrived.
 */
export const publishState = (payload) => {
  const status = payload?.data?.status;

  if (status === "SEND_TO_USER_INBOX" || status === "PUBLISH_COMPLETE") {
    return { done: true, ok: true };
  }
  if (status === "FAILED") {
    return {
      done: true,
      ok: false,
      reason: payload.data.fail_reason ?? payload.data.error_code ?? "FAILED",
    };
  }
  return { done: false, ok: false };
};

/**
 * The caption to publish alongside the video.
 *
 * 🔴 The inbox endpoint accepts NO caption — TikTok's draft flow has the
 * person write it in the app. So this is printed for pasting rather than sent,
 * and the UTM guard still applies: a video published without its own link is
 * unattributable, and a video published with ANOTHER platform's link is worse,
 * because it looks like data.
 */
export const buildTikTokCaption = (entry) => {
  const link = entry.utmLinks?.tiktok;
  if (!link) {
    throw new Error(`${entry.v}: no tiktok utm link — refusing to publish untracked`);
  }

  const body = entry.tiktokCaption ?? entry.instagramCaption ?? entry.title;
  // TikTok does not linkify caption URLs either, so the same reasoning as
  // Meta applies — see LINK_IN_BIO in lib/meta.mjs for what this costs.
  return [body, "", LINK_IN_BIO, "", (entry.hashtags ?? []).join(" ")].join("\n");
};
