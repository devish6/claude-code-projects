/**
 * Per-platform extra arguments for `publish-next`.
 *
 * 🔴 EXPERIMENT, 2026-08-08 — YOUTUBE UPLOADS GO OUT **PRIVATE** ON PURPOSE.
 *
 * Measured that day: API-uploaded Shorts get ZERO Shorts-feed distribution.
 * M9R (publisher) 2 views, 100% of them from subscriber notifications, no
 * Shorts-feed row at all; M8R (hand-posted, same series, same pipeline render)
 * 158 views, 94.3% from the Shorts feed. Across the whole ledger no publisher
 * upload has ever exceeded 3 views, while hand-posts median ~17 and reach 146.
 * Content is ruled out: the same two files scored 205 vs 211 on TikTok.
 *
 * The mechanism is invisible to the Data API (license, restrictions, Shorts
 * classification and every status field are identical across both routes), so
 * this splits the remaining question in two:
 *
 *   upload private via API → owner flips to public BY HAND in Studio
 *     → feed traffic returns ⇒ the API *publish event* is what kills it
 *     → still zero          ⇒ the *metadata the API sets* is what kills it
 *
 * Until that reads out, every YouTube upload needs a MANUAL flip to public or
 * it will sit private and the day's post is lost. Do not "fix" this back to
 * public without the readout — public is the setting that produced 2 views.
 */
export const YOUTUBE_PRIVACY = "private";

/** @param {string} platform */
export const extraArgsFor = (platform) =>
  platform === "youtube" ? [`--privacy=${YOUTUBE_PRIVACY}`] : [];
