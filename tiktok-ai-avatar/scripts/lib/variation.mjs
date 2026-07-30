/**
 * Structural variation — the fix for what killed the first TikTok account.
 *
 * MEASURED 2026-07-30: all 28 renders were EXACTLY 17.450667s, 1080x1920,
 * 30fps, cutting on frames 48/192/264/336, on one palette. TikTok withheld
 * them as repeated content. Literal zero views is the signature of never
 * being distributed — weak content still draws a few hundred from the test
 * pool, so zero means suppression, not quality.
 *
 * The old engine said it out loud: "only the copy and the number change
 * between videos... two variants share every frame of motion." That bought
 * cheap A/B testing and cost the account.
 *
 * Duplicate detection keys on structural invariants, so the variation has to
 * be structural too. Four axes vary per video, and the combination is
 * guaranteed unique inside a rolling window.
 *
 * Deterministic throughout: the same date and slot always yield the same
 * variation, so a run is reproducible and reviewable before it renders.
 */

/**
 * Act structures. Durations are deliberately spread and deliberately exclude
 * 17.4 — the fingerprinted length. Acts sum exactly to `seconds`.
 */
export const STRUCTURES = [
  { id: "snap", seconds: 14.2, acts: { hook: 1.2, build: 3.6, value: 7.4, cta: 2.0 } },
  { id: "standard", seconds: 19.6, acts: { hook: 1.6, build: 5.2, value: 10.4, cta: 2.4 } },
  { id: "essay", seconds: 23.4, acts: { hook: 2.0, build: 6.4, value: 12.4, cta: 2.6 } },
  { id: "long", seconds: 27.8, acts: { hook: 2.4, build: 7.8, value: 14.8, cta: 2.8 } },
];

/**
 * Tempos. 150 BPM is retained but is no longer universal — at 30fps it is a
 * whole 12-frame beat, which is exactly what pinned every cut to one grid.
 * The others deliberately produce fractional frames-per-beat so transients
 * land in different places.
 */
export const TEMPOS = [128, 140, 150, 165];

/** Distinct visual arrangements, not one engine with different words. */
export const LAYOUTS = ["centered", "split", "fullbleed", "grid", "footage"];

/** One palette across 14 videos was itself a fingerprint. */
export const PALETTES = ["sage-gold", "ink-violet", "ember", "mono"];

/** How far back the no-repeat rule looks. */
export const VARIATION_WINDOW_DAYS = 14;

/** The tuple duplicate detection can actually see. */
export const fingerprint = ({ structure, tempo, layout, palette }) =>
  `${structure}|${tempo}|${layout}|${palette}`;

const daysBetween = (a, b) => Math.abs(new Date(a) - new Date(b)) / 86_400_000;

/**
 * A small deterministic hash, so a date+slot maps to a stable starting point
 * in each pool. No RNG: two runs of the same day must be identical.
 */
const hash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const recentVideos = (state, dateISO) =>
  (state.videos ?? []).filter(
    (v) => v.variation && daysBetween(v.date, dateISO) <= VARIATION_WINDOW_DAYS,
  );

/**
 * Picks a structurally distinct variation for one video.
 *
 * Walks each pool from a date-derived offset and takes the first combination
 * whose fingerprint is unused in the window and whose layout differs from the
 * immediately previous video. Falls back to the least-recently-used
 * combination rather than throwing — a duplicate-but-rendered video is
 * recoverable, a missing day's batch is not.
 */
export const pickVariation = (state, dateISO, slot) => {
  const recent = recentVideos(state, dateISO);
  const used = new Set(recent.map((v) => fingerprint(v.variation)));
  const previousLayout = (state.videos ?? []).filter((v) => v.variation).at(-1)?.variation.layout;

  // Each axis gets its OWN seed. Deriving all four from one offset made
  // structure index equal tempo index, so 14.2s was always 128 BPM and 27.8s
  // always 165 — collapsing 16 duration/tempo combinations to 4 and rebuilding
  // a weaker copy of the fingerprint this module exists to destroy.
  const seeds = {
    structure: hash(`${dateISO}:${slot}:structure`),
    tempo: hash(`${dateISO}:${slot}:tempo`),
    layout: hash(`${dateISO}:${slot}:layout`),
    palette: hash(`${dateISO}:${slot}:palette`),
  };
  let fallback = null;

  for (let i = 0; i < STRUCTURES.length; i++) {
    for (let j = 0; j < TEMPOS.length; j++) {
      for (let k = 0; k < LAYOUTS.length; k++) {
        for (let l = 0; l < PALETTES.length; l++) {
          const candidate = {
            structure: STRUCTURES[(seeds.structure + i) % STRUCTURES.length].id,
            tempo: TEMPOS[(seeds.tempo + j) % TEMPOS.length],
            layout: LAYOUTS[(seeds.layout + k) % LAYOUTS.length],
            palette: PALETTES[(seeds.palette + l) % PALETTES.length],
          };
          fallback ??= candidate;
          if (used.has(fingerprint(candidate))) continue;
          if (candidate.layout === previousLayout) continue;
          return candidate;
        }
      }
    }
  }

  return fallback;
};

/**
 * The guard. Returns every fingerprint reused inside the window — the exact
 * condition that got the account suppressed. Empty means the run is safe.
 */
export const findDuplicateFingerprints = (state) => {
  const videos = (state.videos ?? []).filter((v) => v.variation);
  const duplicates = [];

  for (let i = 0; i < videos.length; i++) {
    for (let j = i + 1; j < videos.length; j++) {
      if (daysBetween(videos[i].date, videos[j].date) > VARIATION_WINDOW_DAYS) continue;
      if (fingerprint(videos[i].variation) === fingerprint(videos[j].variation)) {
        duplicates.push({
          a: videos[i].v,
          b: videos[j].v,
          fingerprint: fingerprint(videos[i].variation),
        });
      }
    }
  }

  return duplicates;
};

/** Resolves a structure id to the act seconds ViralVideo's `structure` prop wants. */
export const structureById = (id) => {
  const found = STRUCTURES.find((s) => s.id === id);
  if (!found) throw new Error(`unknown structure id: ${id}`);
  return found.acts;
};
