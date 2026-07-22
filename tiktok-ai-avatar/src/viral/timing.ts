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
  hook: 2, // 0–2s       stop the scroll
  build: 6, // 2–8s       open a curiosity loop, never fully resolve
  value: 10.75, // 8–18.75s  the actual payload, rapid-fire
  cta: 3, // 18.75–21.75s branding is allowed ONLY here
  total: 21.75,
} as const;

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
export const SCENE_CHANGE = 45; // 1.5s
/** Attention reset cadence — fire a PatternInterrupt at least this often. */
export const INTERRUPT_EVERY = sec(3.5);

/** A trait bullet may never sit on screen longer than this. */
export const BULLET_HOLD = sec(2);
