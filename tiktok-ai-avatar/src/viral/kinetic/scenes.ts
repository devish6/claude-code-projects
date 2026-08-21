import { FPS, sec } from "../timing";

/**
 * The KINETIC scene model — the retention contract for the format pivot.
 *
 * 🔴 WHY THIS EXISTS, AND WHY `SCENE_CHANGE` WAS NOT ENOUGH.
 *
 * `timing.ts` has enforced `SCENE_CHANGE = 36` (1.2s) since cycle 1: "if the
 * same visual composition is on screen longer than that, the video fails."
 * Every V-series render passed it. And every V-series render put a Metatron
 * mandala on screen at frame 0 and left it there for the whole video, swapping
 * only the TEXT on top of it.
 *
 * ⭐⭐⭐ So the gate measured the layer that changed and never looked at the
 * layer that didn't. The frame a viewer actually sees was static for 19.6
 * seconds while a green gate reported a 1.2s scene cadence. Same class as the
 * blank frame 0, the 2.13s hole, and `checkTraitParity` — a check that cannot
 * fail the way the real operation fails.
 *
 * 📉 What it cost, measured: V42 held 62.8% at 1s (second-best of the era) and
 * averaged 2.66s of watch time — the second-LOWEST of all 56 posts this account
 * has ever published. Windsor puts the distribution gate at avg watch >= ~6.4s
 * (0 of 41 posts below it ever escaped; 12 of 15 above it did). The hook was
 * never the problem.
 *
 * ⇒ A scene here owns the WHOLE FRAME, background included. `checkFrameChanges`
 * fails when two neighbouring scenes share a background, which is exactly what
 * the old format does on every single cut.
 */

/** No scene may hold the full frame longer than this. Tighter than SCENE_CHANGE
 *  because the whole frame now turns over, not just the copy on top of it. */
export const KINETIC_SCENE_MAX = sec(1.7);

/** ...nor be so short it cannot be read. Measured floor from the montage work:
 *  under ~0.35s a line is not read, it is glimpsed. A full-frame scene carries
 *  more than one line, so it needs more. */
export const KINETIC_SCENE_MIN = sec(1.0);

export type KineticScene = {
  /** Seconds this scene owns the frame. */
  seconds: number;
  /** The flat colour field behind everything. Adjacent scenes MUST differ. */
  bg: string;
  /** Foreground ink. */
  fg: string;
  /** Optional accent for the one word that carries the beat. */
  accent?: string;
  /** The big kinetic line. Rendered letter by letter. */
  headline?: string;
  /** A number set huge — the reveal beats. */
  digit?: number;
  /** Small label above (planet, kicker). */
  kicker?: string;
  /** Body line under the headline. */
  sub?: string;
  /**
   * How hard to darken the ground under the type.
   *
   * 🪤 NOT COSMETIC. Watching the first render caught both ends of this: the
   * night grounds are already near-black, so a normal scrim crushed scene 2 to
   * mean 7.8 and we paid for a photograph to render a black screen; and the
   * dawn ground is pale, so the CTA's dark type had almost no contrast and
   * `numevix.com` disappeared. Match the scrim to the ground, not to a default.
   */
  scrim?: "light" | "normal" | "heavy";
};

export type Gate = { name: string; ok: boolean; detail?: string };

/**
 * 🔴 THE GATE THE OLD FORMAT FAILS.
 *
 * Two neighbouring scenes sharing a background means the viewer's eye is given
 * nothing new — the cut is invisible even when the text swapped. Run against
 * any V-series structure (one palette, held throughout) this fails on every
 * boundary, which is the positive control in `scenes.test.ts`.
 */
export const checkFrameChanges = (scenes: KineticScene[]): Gate => {
  const same: string[] = [];
  for (let i = 1; i < scenes.length; i++) {
    if (scenes[i].bg === scenes[i - 1].bg) same.push(`${i - 1}->${i} both ${scenes[i].bg}`);
  }
  return {
    name: "every cut changes the background",
    ok: same.length === 0,
    detail: same.length ? `${same.length} invisible cut(s): ${same.join(", ")}` : undefined,
  };
};

/** No scene overstays; none is too brief to read. */
export const checkSceneDurations = (scenes: KineticScene[]): Gate => {
  const bad = scenes
    .map((s, i) => ({ i, f: sec(s.seconds) }))
    .filter(({ f }) => f > KINETIC_SCENE_MAX || f < KINETIC_SCENE_MIN)
    .map(({ i, f }) => `scene ${i} = ${f}f`);
  return {
    name: `every scene within [${KINETIC_SCENE_MIN}, ${KINETIC_SCENE_MAX}] frames`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * ⭐ THE STRUCTURAL FIX, AS A GATE.
 *
 * V42's payload was complete at 2.0s — the cover accent literally read
 * "IT'S 1 AND 7" — so a viewer had the whole answer at frame 0 and no reason to
 * reach second 3. Retention collapsed 62.8% -> 35.2% -> 19.0% across 1s->2s->3s.
 *
 * The distribution gate is average watch time, so the video has to still be
 * PAYING at 6.4s. This asserts the last reveal lands at or after `minSeconds`:
 * the open loop cannot close early.
 */
export const checkPayoffLate = (scenes: KineticScene[], payoffIndex: number, minSeconds = 6.4): Gate => {
  const start = scenes.slice(0, payoffIndex).reduce((a, s) => a + s.seconds, 0);
  return {
    name: `payoff lands at or after ${minSeconds}s`,
    ok: start >= minSeconds,
    detail: `payoff starts at ${start.toFixed(2)}s`,
  };
};

export const totalFrames = (scenes: KineticScene[]): number =>
  scenes.reduce((a, s) => a + sec(s.seconds), 0);

export const sceneOffsets = (scenes: KineticScene[]): number[] => {
  const out: number[] = [];
  let f = 0;
  for (const s of scenes) {
    out.push(f);
    f += sec(s.seconds);
  }
  return out;
};

export const runKineticGates = (scenes: KineticScene[], payoffIndex: number): Gate[] => [
  checkFrameChanges(scenes),
  checkSceneDurations(scenes),
  checkPayoffLate(scenes, payoffIndex),
];

/** Throws before frame 1, the way `assertRenderable` does for ViralVideo. */
export const assertKineticRenderable = (id: string, scenes: KineticScene[], payoffIndex: number): void => {
  const failed = runKineticGates(scenes, payoffIndex).filter((g) => !g.ok);
  if (failed.length === 0) return;
  throw new Error(
    `${id} is not renderable:\n` + failed.map((g) => `  ✗ ${g.name}${g.detail ? ` — ${g.detail}` : ""}`).join("\n"),
  );
};

export { FPS };
