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
export const VIRAL_TIMING = {
  hook: 1.6, // 0–1.6s      stop the scroll
  build: 4.8, // 1.6–6.4s    open a curiosity loop, never fully resolve
  value: 8.6, // 6.4–15.0s   the actual payload, rapid-fire
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
export const makeValueScenes = (valueFrames: number) => {
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
  const count = Math.max(1, Math.ceil(pairBudget / maxPair));
  // Round UP, so the remainder is absorbed by making the LAST pair shorter.
  // Rounding down and dumping the remainder on the last pair pushed it over
  // the ceiling by a frame — 1.217s against a 1.2s limit.
  const even = Math.ceil(pairBudget / count);

  const pairs = Array.from({ length: count }, (_, i) =>
    i === count - 1 ? pairBudget - even * (count - 1) : even,
  );

  return { number, pairs, montage };
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
