/**
 * Performance data for published videos — the input the whole optimisation
 * loop was missing.
 *
 * ⭐ THIS IS A TIME SERIES, NOT A SNAPSHOT, and that is the load-bearing
 * decision. "V22 has 400 views" answers nothing on its own; "V22 reached 400
 * in 24h while V19 reached 90" is the comparison that ranks a hook. A single
 * overwritten row throws away exactly the shape retention analysis needs, and
 * it cannot be reconstructed later — the platforms only ever report a running
 * total. So every collection APPENDS a dated sample and nothing is ever
 * mutated in place.
 *
 * Metrics are keyed by the V-number, which is also the `utm_content` value, so
 * platform-side counts and GA4 sessions join on one string with no mapping
 * table in between.
 */

/** One collection run's sample for one video on one platform. */
export const sampleKey = (row) => `${row.platform}:${row.v}:${row.collectedAt}`;

/**
 * Append samples, refusing duplicates for the same platform+video+timestamp.
 *
 * Re-running the collector twice in one minute must not double-count. Two runs
 * on different days must both be kept — that is the series.
 */
export const appendSamples = (existing, incoming) => {
  const seen = new Set((existing ?? []).map(sampleKey));
  const added = (incoming ?? []).filter((r) => !seen.has(sampleKey(r)));
  return [...(existing ?? []), ...added];
};

/**
 * Latest sample per platform+video.
 *
 * Sorted by collectedAt rather than trusting array order, because samples are
 * appended by several collectors and a failed run can land out of order.
 */
export const latestPerVideo = (samples) => {
  const best = new Map();
  for (const s of samples ?? []) {
    const k = `${s.platform}:${s.v}`;
    const prev = best.get(k);
    if (!prev || new Date(s.collectedAt) > new Date(prev.collectedAt)) best.set(k, s);
  }
  return [...best.values()];
};

/**
 * Growth between the first and last sample of a video.
 *
 * Returns null when there is only one sample: a single observation has no
 * growth, and reporting 0 would read as "this video is dead" rather than
 * "we have not measured it twice yet". That distinction decides whether a
 * hook gets retired, so it must not be papered over.
 */
export const growth = (samples, platform, v) => {
  const mine = (samples ?? [])
    .filter((s) => s.platform === platform && s.v === v)
    .sort((a, b) => new Date(a.collectedAt) - new Date(b.collectedAt));
  if (mine.length < 2) return null;
  const first = mine[0];
  const last = mine.at(-1);
  const hours = (new Date(last.collectedAt) - new Date(first.collectedAt)) / 3_600_000;
  return {
    v,
    platform,
    views: (last.views ?? 0) - (first.views ?? 0),
    comments: (last.comments ?? 0) - (first.comments ?? 0),
    likes: (last.likes ?? 0) - (first.likes ?? 0),
    hours: Number(hours.toFixed(2)),
    samples: mine.length,
  };
};

/**
 * Shortest span that can produce a meaningful rate.
 *
 * Two collections a minute apart give an hours value near 0.02, and dividing
 * by it turns a single view into "50/hour" — or, more often, reports 0/h for
 * everything and makes a healthy video look dead. Neither is a measurement.
 */
export const MIN_VELOCITY_HOURS = 1;

/**
 * Rank videos by views per hour since first observation.
 *
 * Per-hour rather than absolute, because a video posted a week ago has had a
 * week to accumulate. Ranking on the raw total would permanently favour
 * whatever is oldest and make every new hook look like a failure.
 *
 * Videos whose samples are closer together than MIN_VELOCITY_HOURS are omitted
 * rather than ranked, for the same reason `growth` returns null on a single
 * sample: "not measured over a long enough window" and "performing at zero"
 * are different claims, and only one of them should retire a hook.
 */
export const rankByVelocity = (samples) => {
  const keys = new Set((samples ?? []).map((s) => `${s.platform}:${s.v}`));
  return [...keys]
    .map((k) => {
      const [platform, v] = k.split(":");
      const g = growth(samples, platform, v);
      if (!g || g.hours < MIN_VELOCITY_HOURS) return null;
      return { ...g, viewsPerHour: Number((g.views / g.hours).toFixed(2)) };
    })
    .filter(Boolean)
    .sort((a, b) => b.viewsPerHour - a.viewsPerHour);
};
