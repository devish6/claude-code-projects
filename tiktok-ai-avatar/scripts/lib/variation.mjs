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

/**
 * Distinct visual arrangements, not one engine with different words.
 *
 * "footage" was considered and dropped: the only footage available is the
 * owner's personal talking-head files, which are gitignored out of this public
 * repo, so a layout depending on them could not render on a clean checkout.
 */
export const LAYOUTS = ["centered", "split", "fullbleed", "grid", "stack"];

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
 *
 * `takenToday` is the day's already-chosen variations. It has to be passed in
 * because `state.videos` is NOT appended during a run, so this function is
 * otherwise blind to its own siblings: on 2026-07-31 that produced V19 and V21
 * at the same 19.648s, same tempo and same palette, differing only in layout.
 * They cleared the fingerprint check because that compares the full 4-tuple,
 * but DURATION is the signal that got the previous account withheld — 28
 * renders, every one exactly 17.450667s. Two same-day twins are the worst
 * case, because they are posted hours apart into the same feed.
 */
export const pickVariation = (state, dateISO, slot, takenToday = []) => {
  const recent = recentVideos(state, dateISO);
  const used = new Set(recent.map((v) => fingerprint(v.variation)));
  const previousLayout = (state.videos ?? []).filter((v) => v.variation).at(-1)?.variation.layout;
  const structuresToday = new Set(takenToday.map((v) => v.structure));

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

  // Two passes. The first refuses any structure already used today; the second
  // drops that rule, for the case where a day has more slots than there are
  // structures (4). Relaxing beats failing: a fifth video sharing a duration
  // with the first is far better than a missing video.
  for (const avoidSameDayStructure of [true, false]) {
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
            if (avoidSameDayStructure && structuresToday.has(candidate.structure)) continue;
            if (used.has(fingerprint(candidate))) continue;
            if (candidate.layout === previousLayout) continue;
            return candidate;
          }
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

export const ACT_ORDER = ["hook", "build", "value", "cta"];

/**
 * Snaps a structure's act boundaries onto the beat grid of the bed that will
 * actually play under it.
 *
 * 🔴 WHY THIS EXISTS — the defect it fixes shipped in V19–V25 and was audible.
 * The four STRUCTURES above were chosen for DURATION VARIETY (14.2 / 19.6 /
 * 23.4 / 27.8s) and their act seconds were never checked against a tempo. The
 * old single 17.45s structure had been beat-designed by hand — its cuts landed
 * on frames 48/192/264/336, all multiples of the 12-frame beat of a 150 BPM
 * bed. Nothing carried that property forward.
 *
 * The arithmetic: `standard` cuts at frames 48/204/516/588. Its bed is
 * starlightV03 at 139.7 BPM = 12.885 frames per beat. 48 / 12.885 = 3.72 beats
 * — a cut three quarters of the way between two beats. Measured on V24 the
 * boundaries sat 118 / 72 / 20 / 157 ms off the nearest beat. A cut ~150ms from
 * the beat is the worst possible place for it: far enough to read as a mistake,
 * close enough that the ear expects the hit.
 *
 * ⭐ THE FIX IS TO SNAP THE PICTURE TO THE MUSIC, NOT THE MUSIC TO THE PICTURE.
 * Re-tempoing a bed onto the structure was rejected before (`be550c5`): our BPM
 * estimates are ~±1%, so stretching by a factor drawn from them fits noise.
 * Moving a cut by up to half a beat is exact, costs nothing, and leaves the
 * audio untouched.
 *
 * ⭐ BOUNDARIES ARE SNAPPED CUMULATIVELY, NEVER ACT BY ACT. Rounding each act's
 * own length independently lets the error accumulate down the video, so the
 * final cut drifts furthest — and the CTA is the cut that matters most. Anchor
 * on the running total and every boundary stays within half a frame (≤17ms) of
 * a true beat.
 *
 * Each boundary is forced at least one beat past the previous one, so a very
 * short act under a slow bed cannot collapse to zero frames.
 *
 * ⭐⭐ `phaseMs` IS AS LOAD-BEARING AS THE TEMPO, and was the second half of the
 * bug. Aligning to the beat PERIOD only works if beat zero sits at file zero —
 * otherwise every cut is correctly spaced and uniformly wrong. Measured across
 * the pool the offsets ran from 25ms to 199ms; `aggroTechnoV12` at 199ms
 * against a 400ms beat is half a beat out, so aligning it to period alone would
 * have put every one of its cuts exactly between two beats. Anchoring the grid
 * at the first real downbeat costs nothing and removes a whole class of "the
 * maths is right but it sounds wrong".
 *
 * Returns act seconds, the same shape `structureById` returns, because that is
 * what ViralVideo's `structure` prop takes.
 */
export const beatAlignedActs = (acts, bpm, { fps = 30, phaseMs = 0 } = {}) => {
  if (!bpm || bpm <= 0) return { ...acts };
  const beatFrames = (60 / bpm) * fps;

  // Fold the phase to the nearest beat, signed: a bed whose downbeat sits at
  // 413ms under a 428ms beat is 15ms EARLY, not 413ms late, and shifting the
  // whole grid forward by 413ms would be the larger error of the two.
  let phaseFrames = ((phaseMs || 0) / 1000) * fps;
  phaseFrames = ((phaseFrames % beatFrames) + beatFrames) % beatFrames;
  if (phaseFrames > beatFrames / 2) phaseFrames -= beatFrames;

  const gridFrame = (beats) => Math.round(phaseFrames + beats * beatFrames);

  let targetFrames = 0;
  let prevFrame = 0;
  let prevBeats = 0;
  const aligned = {};

  for (const act of ACT_ORDER) {
    targetFrames += (acts[act] ?? 0) * fps;
    const beats = Math.max(prevBeats + 1, Math.round((targetFrames - phaseFrames) / beatFrames));
    const frame = Math.max(prevFrame + 1, gridFrame(beats));
    aligned[act] = (frame - prevFrame) / fps;
    prevFrame = frame;
    prevBeats = beats;
  }

  return aligned;
};

/**
 * How far each act boundary sits from the nearest beat, in milliseconds.
 * Used by the tests and by the daily run's pre-flight print, so a structure
 * that drifts off the grid fails loudly instead of being noticed on the feed.
 */
export const beatOffsetsMs = (acts, bpm, { fps = 30, phaseMs = 0 } = {}) => {
  const beatFrames = (60 / bpm) * fps;
  let phaseFrames = ((phaseMs || 0) / 1000) * fps;
  phaseFrames = ((phaseFrames % beatFrames) + beatFrames) % beatFrames;
  if (phaseFrames > beatFrames / 2) phaseFrames -= beatFrames;

  let frames = 0;
  return ACT_ORDER.map((act) => {
    frames += (acts[act] ?? 0) * fps;
    const n = Math.round((frames - phaseFrames) / beatFrames);
    return Math.round(((frames - (phaseFrames + n * beatFrames)) / fps) * 1000);
  });
};

/**
 * Snaps act boundaries onto TRACKED beat times rather than a computed grid.
 *
 * ⭐⭐ THIS SUPERSEDES `beatAlignedActs` WHEREVER A BEAT MAP EXISTS, and the
 * reason is that the constant-tempo model turned out to be false for both kinds
 * of music we have. Library beds do not hold one tempo across a whole file —
 * `voltSlope` measures 152.2 over 30 seconds and 150.8 over the first 14 — and
 * every generated bed drifts by around 2%. `beatAlignedActs` computes where a
 * beat OUGHT to be; this asks where one actually WAS.
 *
 * Boundaries are snapped in order, each to the nearest recorded beat that is
 * later than the previous boundary, so acts can never invert or collapse. A
 * boundary is only moved if a beat lies within `tolerance` of it — beyond that
 * the map has a gap and the original timing is the safer answer.
 *
 * `beats` is an array of seconds from file zero, as produced by
 * `beatMap()` in scripts/lib/tempo.mjs.
 */
export const snapActsToBeats = (acts, beats, { fps = 30, tolerance = 0.28 } = {}) => {
  if (!beats?.length) return { ...acts };

  let target = 0;
  let prevFrame = 0;
  const aligned = {};

  for (const act of ACT_ORDER) {
    target += acts[act] ?? 0;
    const minTime = (prevFrame + 1) / fps;

    let best = null;
    for (const b of beats) {
      if (b < minTime) continue;
      if (best === null || Math.abs(b - target) < Math.abs(best - target)) best = b;
      if (b > target && best !== null && b - target > Math.abs(best - target)) break;
    }

    const frame =
      best !== null && Math.abs(best - target) <= tolerance
        ? Math.max(prevFrame + 1, Math.round(best * fps))
        : Math.max(prevFrame + 1, Math.round(target * fps));

    aligned[act] = (frame - prevFrame) / fps;
    prevFrame = frame;
  }

  return aligned;
};
