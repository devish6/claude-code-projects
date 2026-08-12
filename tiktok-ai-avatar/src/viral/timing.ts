/**
 * Viral timing constants — the retention contract for short-form.
 *
 * These are deliberately much tighter than the original promo system
 * (src/promos/*), which held a single composition for 3–8s behind a
 * cross-fade. The rule that matters most is SCENE_CHANGE: if the same
 * visual composition is on screen longer than that, the video fails.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Seconds → frames. Use everywhere instead of raw frame maths. */
export const sec = (s: number): number => Math.round(s * FPS);

// ── Act structure (seconds) ─────────────────────────────────────────────────
// 🔴 CYCLE 1, 2026-08-09: the payload beat moved from 6.4s to 2.0s.
//
// The `build` act's contract used to read "open a curiosity loop, never fully
// resolve", and it ran 1.6-6.4s. Viewers read the hook — which is why they
// were still present at 1.6s — and then left during the 4.8 seconds before
// anything they were promised arrived. We asked someone who decides in under
// two seconds to wait nearly five on faith.
//
// ⭐ `total` is UNCHANGED at 17.4 and every STRUCTURES total is unchanged too.
// Duration is the strongest signal a duplicate detector has, and this is one
// change per cycle: the boundaries move, the lengths do not.
export const VIRAL_TIMING = {
  hook: 1.2, // 0–1.2s      stop the scroll
  build: 0.8, // 1.2–2.0s    ONE beat of setup, then pay
  value: 13.0, // 2.0–15.0s   the payload, rapid-fire
  cta: 2.4, // 15.0–17.4s  branding is allowed ONLY here
  total: 17.4,
} as const;

export type ActSeconds = {
  hook: number;
  build: number;
  value: number;
  cta: number;
};

/**
 * Frame offsets for one act structure.
 *
 * Exists because `durationInFrames` used to be the single constant
 * `ACT.total`, which made every video EXACTLY 17.450667s. TikTok read the set
 * as repeated content and withheld it. Duration is the strongest signal a
 * duplicate detector has, so it must vary per video — see
 * scripts/lib/variation.mjs for the pool.
 */
export const makeActs = ({ hook, build, value, cta }: ActSeconds) => ({
  hookStart: 0,
  hookEnd: sec(hook),
  buildStart: sec(hook),
  buildEnd: sec(hook + build),
  valueStart: sec(hook + build),
  valueEnd: sec(hook + build + value),
  ctaStart: sec(hook + build + value),
  total: sec(hook + build + value + cta),
});

/**
 * Splits a value act into its four scenes.
 *
 * These were hardcoded frame counts (72/72/42) sized for one 8.6s act, so any
 * other act length would have run the montage past the CTA. Proportional now,
 * with the montage floor enforced.
 *
 * 🔴 The montage floor is not a preference: 4 traits over 1.0s gave each
 * ~0.23s, below reading threshold. 0.35s each is the measured floor.
 */
/**
 * Snaps a run of scene lengths onto TRACKED beat times.
 *
 * ⭐⭐ WHY THIS EXISTS. `snapActsToBeats` (scripts/lib/variation.mjs) snaps only
 * the four ACT boundaries. Every cut inside the value act — the number reveal,
 * each trait pair, the montage — was a proportional division and beat-blind.
 * Measured against `starlightV03` on an 18.4s cut, those five cuts sat
 * +49…+125ms off the nearest tracked beat: 3–4 frames, in the section holding
 * five of the video's seven cuts, and 3–7× worse than frame quantisation makes
 * necessary. V03 itself has that drift.
 *
 * 🔴 A snap must never breach `SCENE_CHANGE * 2`. A pair shows two traits, so
 * exceeding it leaves one trait on screen past the 1.2s ceiling — the exact bug
 * that once held traits for 2.05s. A boundary that would breach the ceiling
 * keeps its unsnapped position.
 *
 * `beats` is seconds from video zero; `startFrame` is where the run begins.
 * Returns lengths, not offsets, so it drops in where the arithmetic was.
 */
const snapRun = (
  lengths: number[],
  startFrame: number,
  beats: number[] | undefined,
  ceilings: number[],
  tolerance = 0.28,
): number[] => {
  if (!beats?.length) return lengths;

  const out: number[] = [];
  let prev = startFrame;
  let target = startFrame;

  for (let i = 0; i < lengths.length; i++) {
    target += lengths[i];
    // The last boundary is the act's end, fixed by the act structure — moving
    // it would desync every downstream act.
    if (i === lengths.length - 1) {
      out.push(target - prev);
      break;
    }

    const targetSec = target / FPS;
    let best: number | null = null;
    for (const b of beats) {
      if (b * FPS <= prev) continue;
      if (best === null || Math.abs(b - targetSec) < Math.abs(best - targetSec)) best = b;
      else if (b > targetSec) break;
    }

    const snapped =
      best !== null && Math.abs(best - targetSec) <= tolerance
        ? Math.max(prev + 1, Math.round(best * FPS))
        : target;

    // Ceiling guard — an out-of-range snap is worse than a beat-blind cut.
    const len = snapped - prev;
    const frame = len > 0 && len <= ceilings[i] ? snapped : target;

    out.push(frame - prev);
    prev = frame;
  }

  return out;
};

/** A scene must hold one trait long enough to actually read it. */
const MIN_PAIR = 30; // 1.0s

export const makeValueScenes = (
  valueFrames: number,
  {
    beats,
    startFrame = 0,
    traitCount,
  }: { beats?: number[]; startFrame?: number; traitCount?: number } = {},
) => {
  const MONTAGE_FLOOR = Math.ceil(0.35 * 4 * FPS); // 4 traits, 0.35s each

  const montage = Math.max(MONTAGE_FLOOR, Math.round(valueFrames * 0.16));
  const afterMontage = valueFrames - montage;
  const number = Math.round(afterMontage * 0.3);
  const pairBudget = afterMontage - number;

  // 🔴 A longer act must add SCENES, not seconds. A pair shows two traits, so
  // its ceiling is 2 x SCENE_CHANGE; stretching past that leaves one trait on
  // screen beyond the 1.2s limit timing.ts calls governing — which is how a
  // 14.8s value act ended up holding each trait for 2.05s.
  const maxPair = SCENE_CHANGE * 2;
  const byTime = Math.max(1, Math.ceil(pairBudget / maxPair));

  // ⭐⭐ PREFER ONE TRAIT PER SCENE. `byTime` alone is the FEWEST scenes the
  // ceiling allows, which packs two traits into scenes far too short to show
  // both: 4 traits over 3 scenes of 50 frames left the staggered second bullet
  // just 14 frames — a 0.47s flash — and made the pacing lopsided, two traits
  // rushed then two dwelt on. Splitting to one trait per scene removes the
  // stagger entirely, evens the rhythm, and gives beat-snapping more boundaries
  // to land on.
  //
  // Only ever ADDS scenes (never drops below `byTime`, which the ceiling
  // requires) and never makes one shorter than MIN_PAIR.
  const count = traitCount
    ? Math.max(byTime, Math.min(traitCount, Math.floor(pairBudget / MIN_PAIR)))
    : byTime;
  // Round UP, so the remainder is absorbed by making the LAST pair shorter.
  // Rounding down and dumping the remainder on the last pair pushed it over
  // the ceiling by a frame — 1.217s against a 1.2s limit.
  const even = Math.ceil(pairBudget / count);

  const pairs = Array.from({ length: count }, (_, i) =>
    i === count - 1 ? pairBudget - even * (count - 1) : even,
  );

  // Snap the whole value act as ONE run: number reveal, each pair, then the
  // montage. Ceilings differ per scene — a pair is capped at SCENE_CHANGE * 2,
  // the number reveal and montage only have to stay positive and are bounded by
  // the run's fixed end.
  const run = [number, ...pairs, montage];
  const ceilings = [
    Number.MAX_SAFE_INTEGER,
    ...pairs.map(() => SCENE_CHANGE * 2),
    Number.MAX_SAFE_INTEGER,
  ];
  const snapped = snapRun(run, startFrame, beats, ceilings);

  return {
    number: snapped[0],
    pairs: snapped.slice(1, 1 + pairs.length),
    montage: snapped[snapped.length - 1],
  };
};

/**
 * Deals traits across value scenes, evenly, never leaving a scene empty-handed.
 *
 * ⭐⭐⭐ THIS LIVES HERE SO THE GATE AND THE COMPONENT CANNOT DISAGREE. It was
 * inline in `ViralVideo`'s render body, which is the same reason
 * `runStructuralGates` spent its whole life advisory: a rule computed inside
 * the component is a rule nothing outside the component can check. `plan.ts`
 * lifted the ACT boundaries out for exactly this reason; this is the same move
 * for the one remaining derived quantity.
 *
 * 🔴🔴 THE HOLE HAS NOW APPEARED IN BOTH DIRECTIONS, AND THIS IS THE SECOND FIX.
 * The first was traits > scenes: `ceil(traits.length / pairs.length)` sliced by
 * index put [0,1] and [2,3] in the first two of three scenes and sliced PAST
 * THE END for the third — a ~1.7s hole of bare background that V03, the
 * account's best post, still ships. Even spreading fixed that.
 * ⇒ It did NOT fix scenes > traits. `floor(4/5) = 0` with `4 % 5 = 4` deals
 * [1,1,1,1,0] and the fifth scene gets nothing. V33 hit it the moment a longer
 * `essay` act pushed the scene count to five: **frames 465–528 rendered at
 * stddev 10.3 against the 18 floor — 2.13 seconds of blank screen at 15.5s.**
 * Caught by rendering and LOOKING, again; 435 tests were green.
 *
 * ⛔ Never let this return a zero-length chunk. `checkTraitCoverage` in qa.ts
 * now blocks the render on it, so a video must supply at least as many traits
 * as its structure produces scenes.
 */
export const spreadTraits = (traits: string[], sceneCount: number): string[][] => {
  const base = Math.floor(traits.length / sceneCount);
  const extra = traits.length % sceneCount;
  const chunks: string[][] = [];
  let cursor = 0;
  for (let i = 0; i < sceneCount; i++) {
    const take = base + (i < extra ? 1 : 0);
    chunks.push(traits.slice(cursor, cursor + take));
    cursor += take;
  }
  return chunks;
};

/** Frame offsets for each act. */
export const ACT = {
  hookStart: 0,
  hookEnd: sec(VIRAL_TIMING.hook),
  buildStart: sec(VIRAL_TIMING.hook),
  buildEnd: sec(VIRAL_TIMING.hook + VIRAL_TIMING.build),
  valueStart: sec(VIRAL_TIMING.hook + VIRAL_TIMING.build),
  valueEnd: sec(VIRAL_TIMING.hook + VIRAL_TIMING.build + VIRAL_TIMING.value),
  ctaStart: sec(VIRAL_TIMING.hook + VIRAL_TIMING.build + VIRAL_TIMING.value),
  total: sec(VIRAL_TIMING.total),
} as const;

// ── Motion budgets (frames) ─────────────────────────────────────────────────
/** Transitions are SNAPS. Anything above ~5 frames reads as a fade. */
export const TRANSITION = 4; // 0.13s
/** Text entrance. */
export const TEXT_APPEAR = 6; // 0.20s
/** Hard ceiling on how long one composition may hold. */
export const SCENE_CHANGE = 36; // 1.2s
/** Attention reset cadence — fire a PatternInterrupt at least this often. */
export const INTERRUPT_EVERY = sec(2.8);

/** A trait bullet may never sit on screen longer than this. */
export const BULLET_HOLD = sec(1.6);
/** Frames between the two traits inside a pair scene. */
export const BULLET_STAGGER = 36; // 1.2s
