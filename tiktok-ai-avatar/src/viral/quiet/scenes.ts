import { FPS, sec } from "../timing";

/**
 * The QUIET scene model — the format for a cut that is meant to be FELT.
 *
 * ⭐⭐⭐ WHY A SECOND FORMAT RATHER THAN A SEVENTH KINETIC EPISODE.
 *
 * The owner's brief, 2026-08-29: *"These styles of videos are getting us the
 * one-second hold, but that's all they're getting us. Change the style, make it
 * emotionally touching, make it something extremely relatable."*
 *
 * He is right, and the retention curve he sent agrees: the 1s hold has been
 * flat at 51–53% across V46/V47/V48/V49 while views fell to 84. The hook is no
 * longer the bottleneck. **The PROMISE is.** V43–V49 all sold information — a
 * table, a letter value, a day count. Measured against the market the same
 * night: the 27.9K-follower rival's biggest non-prediction post is ONE LINE of
 * text over quiet footage ("Surrender is the first step towards Bhakti"),
 * 273K views and 34.1K likes, and her 370K prediction post's caption is not
 * information either — it is *"September is finally bringing you the results
 * you've been patiently waiting for."* A feeling, wearing a forecast's clothes.
 *
 * ⭐⭐⭐ THE KINETIC FORMAT STRUCTURALLY CANNOT DO THIS, and that is the whole
 * reason this file exists rather than another `v50-*.ts`:
 *   1. `KINETIC_SCENE_MAX` is 2.2s. **You cannot feel something in 1.7
 *      seconds.** Every kinetic beat is an assertion that lands and clears.
 *   2. `checkFrameChanges` FORBIDS two adjacent scenes sharing a ground, and
 *      12 of our 13 grounds are dark (measured: only `dawn-a` at 115 luma is
 *      light; `night-a` is 8.7). So the gate forces a rotation through dark
 *      assets, and V49 renders at a whole-video mean luma of **27.9/255** —
 *      it drops from 57.9 to 15.8 at 1.9s and never again exceeds 31.3.
 *      The format is *architecturally* a black card with type on it.
 *   3. Hard cut, never a cross-fade. Correct for kinetic; wrong here. A
 *      feeling needs continuity, not a turnover.
 *
 * ⇒ Rather than fight three deliberate rules that are each right for the format
 * they were written for, this is a separate composition with its own contract.
 * ⛔ NOTHING HERE IMPORTS FROM `../kinetic/`. V43–V49 must keep rendering
 * byte-for-byte as published — they are the only controls the account owns.
 *
 * 🪤 AND THE HONEST LIMIT, STATED WHERE IT CANNOT BE SKIPPED. σ of log₁₀(views)
 * with the creative held constant is ≈0.6 on this account — one sigma is a
 * factor of four, and detecting a 2× effect needs 62 posts an arm. **This cut
 * cannot be judged on its own view count and neither can the format.** What
 * justifies the change is not a per-post verdict; it is that the statement/
 * artefact class is 0-for-30 at clearing 500 reach across a 61-post window,
 * which is a class-level result and CAN fire. Read the class, never the post.
 */

/**
 * A quiet scene may hold the frame far longer than a kinetic one.
 *
 * 🔴 THIS CEILING IS THE FORMAT. `KINETIC_SCENE_MAX` is 2.2s and that is the
 * single number that makes the other format incapable of the register being
 * asked for here. A line that names something painful needs to sit long enough
 * for the viewer to recognise themselves in it — recognition is not reading.
 */
export const QUIET_SCENE_MAX = sec(4.0);

/**
 * ...and a floor well above kinetic's 1.0s. Anything under this is a cut, not a
 * hold, and a cut is the thing this format exists to stop doing.
 */
export const QUIET_SCENE_MIN = sec(2.0);

/** How long one scene dissolves into the next. See `checkDissolveFits`. */
export const DISSOLVE = sec(0.5);

export type QuietScene = {
  /** Seconds this scene owns the frame, dissolve included. */
  seconds: number;
  /** The photographic ground. Adjacent scenes MUST differ — see the gate. */
  bg: string;
  /** Foreground ink. */
  fg: string;
  /**
   * The line. ONE sentence, set large and centred.
   *
   * 🔴 NOT A HEADLINE PLUS A SUB. The kinetic model carries `headline` + `sub`
   * + `kicker` + `digit` + `table` and every cut fills most of them, which is
   * how a 1.9s beat ends up carrying four separate things to read. A feeling
   * beat carries ONE. If a line needs a subtitle to land, it is not the line.
   */
  line: string;
  /**
   * An optional second line, set smaller, arriving after the first has been
   * read. Use it for the quiet half of a thought, never for a new thought.
   */
  under?: string;
  /** How hard to darken the ground under the type. */
  scrim?: "light" | "normal" | "heavy";
  /**
   * ⭐ THE WORD THAT CARRIES THE BEAT, set in the accent colour.
   *
   * Must appear verbatim in `line` — `checkAccentWords` fails otherwise, because
   * a highlight that matches nothing silently colours nothing and the beat's one
   * emphasis quietly disappears. Same class as kinetic's out-of-range highlight.
   */
  accentWord?: string;
  /** The accent colour for `accentWord`. */
  accent?: string;
};

export type Gate = { name: string; ok: boolean; detail?: string };

/**
 * Adjacent scenes must still differ — a dissolve between two identical grounds
 * is a 0.5s cross-fade that produces no visible change at all, which is the
 * *worse* version of the invisible cut kinetic's gate was written for.
 */
export const checkGroundChanges = (scenes: QuietScene[]): Gate => {
  const same: string[] = [];
  for (let i = 1; i < scenes.length; i++) {
    if (scenes[i].bg === scenes[i - 1].bg) same.push(`${i - 1}->${i} both ${scenes[i].bg}`);
  }
  return {
    name: "every dissolve changes the ground",
    ok: same.length === 0,
    detail: same.length ? same.join(", ") : undefined,
  };
};

/** No scene overstays; none is so brief it becomes a kinetic cut. */
export const checkHoldDurations = (scenes: QuietScene[]): Gate => {
  const bad = scenes
    .map((s, i) => ({ i, f: sec(s.seconds) }))
    .filter(({ f }) => f > QUIET_SCENE_MAX || f < QUIET_SCENE_MIN)
    .map(({ i, f }) => `scene ${i} = ${f}f`);
  return {
    name: `every hold within [${QUIET_SCENE_MIN}, ${QUIET_SCENE_MAX}] frames`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * 🔴 A DISSOLVE MUST FIT INSIDE THE SCENE IT LEAVES.
 *
 * If `DISSOLVE` is not shorter than the scene, the outgoing ground is still
 * fading while the next one is already fading out — the frame is a permanent
 * average of two photographs and never resolves to either. It renders as mud
 * and no gate downstream would notice, because every frame is "populated".
 */
export const checkDissolveFits = (scenes: QuietScene[]): Gate => {
  const bad = scenes
    .map((s, i) => ({ i, f: sec(s.seconds) }))
    .filter(({ f }) => f <= DISSOLVE * 2)
    .map(({ i, f }) => `scene ${i} = ${f}f vs dissolve ${DISSOLVE}f`);
  return {
    name: `every hold is longer than two dissolves (${DISSOLVE * 2}f)`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * ⭐ AN ACCENT WORD THAT IS NOT IN ITS LINE COLOURS NOTHING.
 *
 * Exactly the failure class as kinetic's out-of-range `highlight`: the render
 * succeeds, the frame is wrong, and the one piece of emphasis in the beat is
 * silently gone. Match is case-sensitive and substring — the renderer splits on
 * the literal, so "Nobody" will not find "nobody".
 */
export const checkAccentWords = (scenes: QuietScene[]): Gate => {
  const bad = scenes
    .map((s, i) => ({ i, s }))
    .filter(({ s }) => s.accentWord !== undefined && !s.line.includes(s.accentWord))
    .map(({ i, s }) => `scene ${i}: "${s.accentWord}" is not in its line`);
  return {
    name: "every accent word appears in its own line",
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/** `#RRGGBB` -> [r,g,b]. */
const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/**
 * 🔴🔴 AN ACCENT THE SAME COLOUR AS THE INK IS NOT AN ACCENT — AND I SHIPPED
 * THIS ONE. `checkAccentWords` proves the word EXISTS in its line. It says
 * nothing about whether the viewer can SEE that it is emphasised, and the first
 * V50 render set scene 4's `accent: "#D8D8D8"` against `fg: "#F2F2F2"` — a
 * channel distance of 26, invisible on a phone. The beat's one piece of
 * emphasis silently did nothing, and every gate was green.
 *
 * ⭐⭐⭐ EXACTLY THE CLASS THIS REPO KEEPS PAYING FOR: a check that cannot fail
 * the way the real operation fails. `checkTableShape` proved a highlight was
 * in range but not that it lit anything; `SCENE_CHANGE` measured the layer that
 * changed and never the layer that didn't. Same shape, third time.
 *
 * 🪤 The threshold is on MAX PER-CHANNEL distance, not on luminance. Two colours
 * can share a luminance and still be plainly different (a gold and a blue at
 * the same brightness), and that is a legitimate accent; the failure being
 * caught is "the same colour", which is a small distance in every channel.
 */
export const MIN_ACCENT_DISTANCE = 60;

export const checkAccentContrast = (scenes: QuietScene[]): Gate => {
  const bad = scenes
    .map((s, i) => {
      if (!s.accentWord || !s.accent) return null;
      const [ar, ag, ab] = rgb(s.accent);
      const [fr, fg2, fb] = rgb(s.fg);
      const d = Math.max(Math.abs(ar - fr), Math.abs(ag - fg2), Math.abs(ab - fb));
      return d < MIN_ACCENT_DISTANCE ? `scene ${i}: ${s.accent} vs ${s.fg} = ${d}` : null;
    })
    .filter((x): x is string => x !== null);
  return {
    name: `every accent differs from its own ink by >= ${MIN_ACCENT_DISTANCE} in some channel`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * ⭐⭐⭐ ONE THING TO READ PER BEAT — THE FORMAT'S CENTRAL CLAIM, AS A GATE.
 *
 * The whole argument for a second format is that a feeling beat carries one
 * sentence, not four stacked objects. Without this gate that claim survives
 * exactly until the first cut where somebody wants to fit one more clause in,
 * and then `quiet` is `kinetic` with longer holds.
 *
 * 🪤 The limit is on WORDS, not characters — a 12-word line at this type size
 * wraps to three lines on a 1080-wide frame and stops being a held sentence.
 */
export const MAX_WORDS = 11;

export const checkLineLength = (scenes: QuietScene[]): Gate => {
  const bad = scenes
    .map((s, i) => ({ i, n: s.line.trim().split(/\s+/).length }))
    .filter(({ n }) => n > MAX_WORDS)
    .map(({ i, n }) => `scene ${i}: ${n} words`);
  return {
    name: `every line is at most ${MAX_WORDS} words`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * The distribution gate is average watch time, so the cut has to still be
 * paying at 6.4s. `payoffIndex` is the beat the whole thing is built to reach.
 */
export const checkPayoffLate = (scenes: QuietScene[], payoffIndex: number, minSeconds = 6.4): Gate => {
  const start = scenes.slice(0, payoffIndex).reduce((a, s) => a + s.seconds, 0);
  return {
    name: `payoff lands at or after ${minSeconds}s`,
    ok: start >= minSeconds,
    detail: `payoff starts at ${start.toFixed(2)}s`,
  };
};

export const totalFrames = (scenes: QuietScene[]): number =>
  scenes.reduce((a, s) => a + sec(s.seconds), 0);

export const sceneOffsets = (scenes: QuietScene[]): number[] => {
  const out: number[] = [];
  let f = 0;
  for (const s of scenes) {
    out.push(f);
    f += sec(s.seconds);
  }
  return out;
};

/**
 * ⭐⭐⭐ THE GROUND'S OPACITY AT FRAME `f` OF ITS OWN SCENE — AND WHY THIS IS
 * LIFTED OUT OF THE COMPONENT.
 *
 * 🔴🔴 THE BUG THIS FORMAT IS BUILT NOT TO HAVE. Measured on the published V48:
 * frame 56 (1.875s) was **0.19% non-black, mean luma 7.05** — a black frame at
 * the payload beat, inside the segment where 56.9% of surviving viewers leave.
 * Cause: the copy's opacity ramped `[0,5] -> [0,1]` at every scene start, and on
 * a dark ground the copy IS the light. `qa:frame` reads frame 0 ONLY, so it
 * could never see it. (Half-fixed in `e7f210c`; V49 measures 8.5% non-black at
 * the same beat, better but still a 3.9× luma drop at the cut.)
 *
 * ⇒ HERE THE GROUNDS CROSS-DISSOLVE AND THE TYPE NEVER FADES FROM ZERO. While
 * scene N fades out, scene N+1 is already fading IN underneath it, so total
 * ground opacity is ~1 throughout and there is no frame where both are absent.
 * That is a structural guarantee, not a tuned constant — which is what the last
 * three fixes in this repo were, and each of them shipped a hole anyway.
 *
 * 🪤 `isFirst` still returns a hard 1. Frame 0 is the poster frame and this repo
 * has shipped it blank TWICE. Do not "tidy" it into the same ramp as the rest.
 *
 * 🔴🔴 AND `isLast` IS THE SAME BUG AT THE OTHER END — I SHIPPED IT ONCE HERE.
 * The first render of V50 measured its FINAL frame at **mean luma 9.4, 4.11%
 * non-black**, under `qa:frame`'s own MIN_MEAN of 12: the out-ramp fired on the
 * closing scene, which has no successor fading in beneath it, so the video ended
 * by dissolving the CTA into black. The dissolve is only safe as a *cross*-fade;
 * an unpaired one is precisely the hole this format was written to make
 * impossible. ⭐ The invariant is "every fade has a partner", not "fades are
 * fine now" — the last scene's partner does not exist, so it must not fade.
 */
export const groundOpacity = (
  f: number,
  frames: number,
  isFirst: boolean,
  isLast: boolean,
): number => {
  const inRamp = isFirst ? 1 : f >= DISSOLVE ? 1 : Math.max(0, f) / DISSOLVE;
  if (isLast) return inRamp;
  const outStart = frames - DISSOLVE;
  const outRamp = f <= outStart ? 1 : Math.max(0, 1 - (f - outStart) / DISSOLVE);
  return Math.min(inRamp, outRamp);
};

/**
 * How the copy arrives. ⛔ NEVER FROM ZERO OPACITY — see `groundOpacity`. The
 * type slides and settles; it does not fade up, because on these grounds the
 * type is the only thing carrying luma.
 */
export const copyEntrance = (f: number, isFirst: boolean): { opacity: number; lift: number } => {
  if (isFirst) return { opacity: 1, lift: 0 };
  const ramp = f >= DISSOLVE ? 1 : Math.max(0, f) / DISSOLVE;
  return { opacity: 1, lift: 22 - 22 * ramp };
};

export const runQuietGates = (scenes: QuietScene[], payoffIndex: number): Gate[] => [
  checkGroundChanges(scenes),
  checkHoldDurations(scenes),
  checkDissolveFits(scenes),
  checkAccentWords(scenes),
  checkAccentContrast(scenes),
  checkLineLength(scenes),
  checkPayoffLate(scenes, payoffIndex),
];

/** Throws before frame 1, the way `assertKineticRenderable` does for kinetic. */
export const assertQuietRenderable = (id: string, scenes: QuietScene[], payoffIndex: number): void => {
  const failed = runQuietGates(scenes, payoffIndex).filter((g) => !g.ok);
  if (failed.length === 0) return;
  throw new Error(
    `${id} is not renderable:\n` + failed.map((g) => `  ✗ ${g.name}${g.detail ? ` — ${g.detail}` : ""}`).join("\n"),
  );
};

export { FPS };
