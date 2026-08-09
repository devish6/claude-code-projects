/**
 * Reading the Windsor.ai Instagram connector.
 *
 * ⭐⭐⭐ This connector solved a problem that had been marked permanently
 * blocked: per-post reach, saves and watch time without
 * `instagram_manage_insights` and without waiting on an App Review that
 * cannot be edited. Instagram went from our worst-instrumented platform to
 * our best in one step.
 *
 * Everything here is PURE. The fetch lives in scripts/analyze-reach.mjs, and
 * the MCP path lives in the analyzer skill — both hand rows to these
 * functions, so the analysis is identical whichever route supplied the data.
 */

/** 🪤 `media_reel_avg_watch_time` is in MILLISECONDS. 3206.0 = 3.2s. */
export const msToSeconds = (ms) =>
  typeof ms === "number" && Number.isFinite(ms) ? Number((ms / 1000).toFixed(2)) : null;

/** Median, or null on an empty set — 0 would read as "measured at zero". */
export const median = (nums) => {
  const xs = (nums ?? []).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
};

/**
 * ⭐⭐ Windsor's `media_id` IS the Graph API id our upload ledgers store, so
 * every metrics row maps onto the exact render that produced it with no
 * manual matching.
 *
 * 🪤 This is NOT true of the id shown in Instagram's own web Insights UI,
 * which is an internal id and does not match.
 */
export const indexByMediaId = (ledgerRows) =>
  new Map((ledgerRows ?? []).filter((r) => r.mediaId).map((r) => [String(r.mediaId), r.v]));

export const joinWindsor = (rows, mediaIdToV, durations) => {
  const dur = durations ?? {};
  return (rows ?? []).map((r) => {
    const v = mediaIdToV?.get(String(r.media_id)) ?? null;
    const watchSeconds = msToSeconds(r.media_reel_avg_watch_time);
    const durationSeconds = v && Number.isFinite(dur[v]) ? dur[v] : null;
    return {
      mediaId: String(r.media_id),
      v,
      timestamp: r.timestamp ?? null,
      reach: r.media_reach ?? null,
      views: r.media_views ?? null,
      likes: r.media_like_count ?? null,
      comments: r.media_comments_count ?? null,
      saves: r.media_saved ?? null,
      watchSeconds,
      durationSeconds,
      completion:
        watchSeconds !== null && durationSeconds
          ? Number((watchSeconds / durationSeconds).toFixed(3))
          : null,
    };
  });
};

const BUCKETS = [
  { label: ">= 6.0s", min: 6, max: Infinity },
  { label: "5.0-5.9s", min: 5, max: 6 },
  { label: "< 5.0s", min: -Infinity, max: 5 },
];

export const bucketByWatchTime = (rows) =>
  BUCKETS.map(({ label, min, max }) => {
    const mine = (rows ?? []).filter(
      (r) => r.watchSeconds !== null && r.watchSeconds >= min && r.watchSeconds < max,
    );
    const reaches = mine.map((r) => r.reach).filter((n) => Number.isFinite(n));
    return {
      label,
      n: mine.length,
      medianReach: median(reaches),
      minReach: reaches.length ? Math.min(...reaches) : null,
      maxReach: reaches.length ? Math.max(...reaches) : null,
    };
  });

/** Splits a run of posts at a date. The boundary date lands in `after`. */
export const splitAt = (rows, isoDate) => {
  const cut = new Date(`${isoDate}T00:00:00Z`).getTime();
  const before = [];
  const after = [];
  for (const r of rows ?? []) {
    (new Date(r.timestamp).getTime() < cut ? before : after).push(r);
  }
  return { before, after };
};

/**
 * Groups high-reach posts that landed close together in time.
 *
 * ⭐⭐ WHY THIS EXISTS. Reading our history as two eras ("healthy, then
 * broken") suggests hunting for a platform change. Reading it as clusters
 * ("6 of 8 winners fell on two days") suggests a few posts got picked up and
 * the rest never did. The two readings recommend opposite work, and the only
 * way to tell them apart is to look at how the winners are distributed in
 * time rather than at their average.
 */
export const findWinnerClusters = (rows, { minReach, windowHours }) => {
  const winners = (rows ?? [])
    .filter((r) => Number.isFinite(r.reach) && r.reach >= minReach)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const clusters = [];
  for (const post of winners) {
    const last = clusters.at(-1);
    const gapMs = last ? new Date(post.timestamp) - new Date(last.posts.at(-1).timestamp) : null;
    if (last && gapMs <= windowHours * 3_600_000) last.posts.push(post);
    else clusters.push({ start: post.timestamp, posts: [post] });
  }
  return clusters;
};

/**
 * ⭐ ALWAYS against the account's own baseline, never as an absolute.
 * Follower count and account age swamp any cross-account signal, and an
 * absolute number tells the reader nothing about whether it is good.
 */
export const describeAgainstBaseline = (row, rows) => {
  // The baseline is the account's own median across every post in the window,
  // INCLUDING this one. Excluding the subject would make the baseline shift
  // depending on which post you asked about, so two posts could never be
  // compared against the same number.
  const watchBase = median((rows ?? []).map((r) => r.watchSeconds));
  const reachBase = median((rows ?? []).map((r) => r.reach));
  return (
    `${row.v ?? row.mediaId} avg watch ${row.watchSeconds}s vs baseline ${watchBase}s · ` +
    `reach ${row.reach} vs baseline ${reachBase}`
  );
};
