import { FPS, sec } from "../timing";
import { GROUND_BANDS, bandCentreY } from "./ground-bands";

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

/**
 * 🔴🔴 THE SCRIM, AS DATA — BECAUSE TWO PLACES NEED THE SAME GRADIENT AND ONLY
 * ONE OF THEM IS ON SCREEN.
 *
 * `QuietVideo` darkens each ground with a CSS gradient so type stays legible.
 * `checkTextContrast` decides whether the type IS legible by modelling that
 * darkening as alpha stops. Written twice, the two drift, and the gate then
 * passes against a scrim nobody renders — the exact failure class already paid
 * for three times here (`checkTableShape` proving a highlight in range but not
 * that it lit anything; `SCENE_CHANGE` measuring the layer that changed and
 * never the one that didn't; an accent proven present but never visible).
 *
 * ⇒ The stops are the source. The CSS is BUILT from them. `scenes.test.ts`
 * pins the built string to the literal that shipped V50–V57, so this
 * refactoring cannot have changed a single rendered pixel of those cuts.
 *
 * ⭐⭐⭐ AND THE SHAPE IS THE POINT: EVERY SCRIM DARKENS DOWNWARD. That is why
 * ink polarity, not scrim weight, is what makes a bright ground legible — see
 * `checkTextContrast`. A scrim heavy enough to carry cream on a light plate has
 * already thrown the plate away.
 */
export type ScrimStop = { at: number; alpha: number };

export const SCRIM_STOPS: Record<"light" | "normal" | "heavy", ScrimStop[]> = {
  // Ground already dark (night-*, violet-*, ember-*) — hold the scrim back or
  // the photograph is thrown away and we are typesetting on black.
  light: [
    { at: 0, alpha: 0.3 },
    { at: 0.38, alpha: 0.1 },
    { at: 0.62, alpha: 0.16 },
    { at: 1, alpha: 0.46 },
  ],
  normal: [
    { at: 0, alpha: 0.52 },
    { at: 0.36, alpha: 0.26 },
    { at: 0.62, alpha: 0.34 },
    { at: 1, alpha: 0.72 },
  ],
  heavy: [
    { at: 0, alpha: 0.48 },
    { at: 0.4, alpha: 0.56 },
    { at: 0.7, alpha: 0.62 },
    { at: 1, alpha: 0.78 },
  ],
};

export const scrimCss = (stops: ScrimStop[]): string =>
  `linear-gradient(180deg, ${stops
    .map((s) => `rgba(0,0,0,${s.alpha.toFixed(2)}) ${Math.round(s.at * 100)}%`)
    .join(", ")})`;

export const SCRIM_CSS = {
  light: scrimCss(SCRIM_STOPS.light),
  normal: scrimCss(SCRIM_STOPS.normal),
  heavy: scrimCss(SCRIM_STOPS.heavy),
} as const;

/**
 * The scrim's alpha at a vertical position `y` in [0,1] of the frame. Linear
 * between stops, exactly as the CSS gradient interpolates.
 */
export const scrimAlphaAt = (stops: ScrimStop[], y: number): number => {
  if (y <= stops[0].at) return stops[0].alpha;
  for (let i = 1; i < stops.length; i++) {
    if (y <= stops[i].at) {
      const span = stops[i].at - stops[i - 1].at;
      const t = span === 0 ? 0 : (y - stops[i - 1].at) / span;
      return stops[i - 1].alpha + t * (stops[i].alpha - stops[i - 1].alpha);
    }
  }
  return stops[stops.length - 1].alpha;
};

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
 * ⭐⭐⭐⭐ THE INK, MEASURED AGAINST THE PHOTOGRAPH IT SITS ON — the check every
 * gate above stops one step short of.
 *
 * `checkAccentContrast` proves the accent differs from the INK. `checkTextContrast`
 * asks the question that actually decides whether a viewer can read the frame:
 * how bright is the GROUND under the type, once the scrim has darkened it, and
 * does the ink clear 3.0:1 against it — at every row of the block, not on
 * average. The accent word is held to the same floor, because an accent nobody
 * can read is the same silent nothing as an accent that matches the ink.
 *
 * 🔴🔴 THIS IS WHAT V58 SHIPPED WITHOUT, AND IT COST THE CUT ITS ARC. Legibility
 * was solved one scene at a time by reaching for a heavier scrim on the bright
 * plates — and a per-scene scrim applied to a luma ladder is a LADDER-FLATTENING
 * OPERATION BY CONSTRUCTION: it darkens exactly the plates whose brightness was
 * the point. Measured on the render: 39% of the bright plates survived and 90%
 * of the dark ones, so scene 3 came out BRIGHTER than scene 2 and the descent
 * inverted in the middle. ⇒ Solve legibility with INK POLARITY instead. Then the
 * scrim can be constant, and a constant scrim cannot flatten anything.
 *
 * 🪤 AND IT IMMEDIATELY CAUGHT ONE NOBODY WAS LOOKING FOR. Under a uniform
 * scrim, V58 scene 3's gold accent measures 2.28:1 against its own plate — a
 * mid-tone ground leaves no room for an accent on either side of it, warm or
 * dark. That plate now carries dark ink with a pale accent instead. No gate in
 * this file could see it before, and the render report never measured it.
 *
 * 🔴 AN UNMEASURED GROUND IS A FAILURE, NOT A SKIP. A gate that quietly passes
 * what it cannot see is the fourth instance of the same class in this repo.
 * Add a plate, re-run `scripts/measure-grounds.mjs`.
 */
export const MIN_TEXT_CONTRAST = 3.0;

const channel = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

/** WCAG relative luminance of an sRGB triple. */
export const relLuminance = ([r, g, b]: [number, number, number]): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

export const contrastRatio = (a: number, b: number): number =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/**
 * The ground's relative luminance in each copy band, once the scrim has been
 * composited over it. The scrim is black at `alpha`, so the ground simply loses
 * that fraction of itself: `C' = C * (1 - alpha)`.
 */
export const groundLuminances = (bg: string, scrim: QuietScene["scrim"]): number[] | null => {
  const bands = GROUND_BANDS[bg];
  if (!bands) return null;
  const stops = SCRIM_STOPS[scrim ?? "normal"];
  return bands.map((band, i) => {
    const a = scrimAlphaAt(stops, bandCentreY(i));
    return relLuminance([band[0] * (1 - a), band[1] * (1 - a), band[2] * (1 - a)]);
  });
};

export const checkTextContrast = (scenes: QuietScene[]): Gate => {
  const bad: string[] = [];
  scenes.forEach((s, i) => {
    const grounds = groundLuminances(s.bg, s.scrim);
    if (!grounds) {
      bad.push(`scene ${i}: ground "${s.bg}" has never been measured — run scripts/measure-grounds.mjs`);
      return;
    }
    const worst = (hex: string) =>
      grounds.reduce((lo, g) => Math.min(lo, contrastRatio(relLuminance(rgb(hex)), g)), Infinity);
    const ink = worst(s.fg);
    if (ink < MIN_TEXT_CONTRAST) bad.push(`scene ${i}: ink ${s.fg} on ${s.bg} = ${ink.toFixed(2)}:1`);
    if (s.accentWord && s.accent) {
      const acc = worst(s.accent);
      if (acc < MIN_TEXT_CONTRAST)
        bad.push(`scene ${i}: accent ${s.accent} on ${s.bg} = ${acc.toFixed(2)}:1`);
    }
  });
  return {
    name: `every ink and accent reads at >= ${MIN_TEXT_CONTRAST}:1 against its own scrimmed ground`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * ⭐⭐⭐⭐ INK POLARITY, AND WHY IT IS DERIVED RATHER THAN DECLARED.
 *
 * The renderer has to know, at a dissolve, whether the two copies about to
 * overlap are the same colour or opposite ones. That could be a field on the
 * scene. It is not, because a field is a thing an author can forget to set, and
 * a forgotten field renders dark lettering stacked on cream lettering with every
 * gate green — the failure shape this file already carries four monuments to.
 * The ink IS the polarity, so it is read straight off `fg`.
 *
 * 🪤 The split is nowhere near any ink in use: every cream here sits above 0.8
 * relative luminance and every dark ink below 0.02.
 */
export const DARK_INK_BELOW = 0.35;

export const isDarkInk = (scene: QuietScene): boolean =>
  relLuminance(rgb(scene.fg)) < DARK_INK_BELOW;

/** Indices `i` whose dissolve into `i + 1` changes ink polarity. */
export const polarityCrossings = (scenes: QuietScene[]): number[] =>
  scenes
    .map((_, i) => i)
    .slice(0, -1)
    .filter((i) => isDarkInk(scenes[i]) !== isDarkInk(scenes[i + 1]));

/**
 * 🔴🔴 THE GROUND MUST CARRY THE FRAME WHILE THE TYPE IS ABSENT.
 *
 * At a polarity crossing the outgoing copy fades out completely before the
 * incoming copy fades in, so for a beat there is NO TYPE ON SCREEN. On a dark
 * ground the copy is the only lit thing — that is the exact hole kinetic shipped
 * at its payload beat (frame 56 of V48: 0.19% non-black, mean luma 7.05) and the
 * reason this format cross-dissolves at all. Opening a text gap over `fold-e`
 * would rebuild it by hand.
 *
 * ⭐ The floor is 5x `qa-frame`'s black-frame `MIN_MEAN` of 12, i.e. the ground
 * alone must be unambiguously a photograph and not a near-black card. Measured
 * over the copy strip: glass-a 168, linen-b 144, plaster-c 120, stone-d 87 pass;
 * threshold-f 54 and fold-e 43 do not.
 */
export const MIN_GAP_GROUND_LUMA = 60;

/** Mean 0–255 luma of a scrimmed ground across the copy strip. */
export const groundLuma = (bg: string, scrim: QuietScene["scrim"]): number | null => {
  const bands = GROUND_BANDS[bg];
  if (!bands) return null;
  const stops = SCRIM_STOPS[scrim ?? "normal"];
  const per = bands.map((band, i) => {
    const a = scrimAlphaAt(stops, bandCentreY(i));
    return (0.299 * band[0] + 0.587 * band[1] + 0.114 * band[2]) * (1 - a);
  });
  return per.reduce((x, y) => x + y, 0) / per.length;
};

export const checkInkPolarityHandoff = (scenes: QuietScene[]): Gate => {
  const crossings = polarityCrossings(scenes);
  const bad: string[] = [];
  // ⭐ ONE CROSSING PER CUT. Each one costs a beat with no type on screen; two
  //   of them inside 16 seconds is a stutter, not a turn.
  if (crossings.length > 1) bad.push(`ink flips ${crossings.length} times; at most one crossing`);
  for (const i of crossings) {
    for (const j of [i, i + 1]) {
      const luma = groundLuma(scenes[j].bg, scenes[j].scrim);
      if (luma === null) {
        bad.push(`scene ${j}: ground "${scenes[j].bg}" has never been measured`);
      } else if (luma < MIN_GAP_GROUND_LUMA) {
        bad.push(`scene ${j}: ${scenes[j].bg} at ${luma.toFixed(0)} luma cannot carry a text-free beat`);
      }
    }
  }
  return {
    name: "an ink polarity change happens once, over grounds that carry the frame alone",
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

/**
 * ⭐⭐⭐⭐ THE TYPE'S OPACITY THROUGH A DISSOLVE — the one place this format
 * deliberately breaks its own "copy never fades" rule, and the reasoning for the
 * exception is the same reasoning that made the rule.
 *
 * The rule (`copyEntrance`, `groundOpacity`): copy NEVER ramps from zero,
 * because on the dark grounds this format was built for THE COPY IS THE LIGHT,
 * and kinetic shipped a mean-luma-7 frame at its payload beat by forgetting it.
 *
 * The exception: at an ink polarity change the two overlapping copies are
 * OPPOSITE COLOURS. Holding both at full opacity for 15 frames puts dark
 * lettering on top of cream lettering — the glitch Codex predicted for V58 the
 * moment a light plate entered the library. So the outgoing copy goes to nothing
 * over the first 40% of the dissolve, the frame carries no type for 20% of it,
 * and the incoming copy arrives over the last 40%.
 *
 * ⇒ And the exception is safe for exactly the reason the rule exists: a polarity
 * change only happens where the ground is bright enough to carry dark ink, so
 * during the gap the PHOTOGRAPH is the light and nothing goes dark.
 * `checkInkPolarityHandoff` refuses a crossing over any ground that cannot.
 *
 * ⛔ WITH BOTH FLAGS FALSE THIS IS A HARD 1 AT EVERY FRAME. V50–V57 must keep
 * rendering byte-for-byte as published.
 */
export const HANDOFF_OUT = 0.4;
export const HANDOFF_IN = 0.6;

export const copyOpacity = (
  f: number,
  frames: number,
  fadeOutAtEnd: boolean,
  fadeInAtStart: boolean,
): number => {
  let o = 1;
  if (fadeInAtStart) {
    const start = DISSOLVE * HANDOFF_IN;
    o = Math.min(o, f <= start ? 0 : Math.min(1, (f - start) / (DISSOLVE - start)));
  }
  if (fadeOutAtEnd) {
    const start = frames - DISSOLVE;
    const span = DISSOLVE * HANDOFF_OUT;
    o = Math.min(o, f <= start ? 1 : Math.max(0, 1 - (f - start) / span));
  }
  return o;
};

/**
 * ⭐⭐⭐ THE UNDER-LINE ARRIVES BY GETTING BRIGHTER — WHICH IS A DIFFERENT EVENT
 * DEPENDING ON WHICH WAY THE INK POINTS.
 *
 * The under-line starts dim and settles, so the main line is read first. On the
 * dark grounds this format was built for, "dim cream" is still the brightest
 * thing in the frame at 0.34 opacity. Dark ink at 0.34 over a LIGHT ground is
 * 34% of the way from the photograph towards black — measured at 1.56–1.73:1,
 * which is not faint, it is absent for the 0.55s the ramp takes.
 *
 * ⇒ The floor is a function of polarity. Cream keeps the 0.34 every shipped cut
 * used, so V50–V57 render byte-for-byte. Dark ink starts at 0.82, measured:
 * glass-a 4.08:1, linen-b 3.85:1, plaster-c 2.90:1 at the moment it appears.
 */
export const CREAM_UNDER_FLOOR = 0.34;
export const DARK_UNDER_FLOOR = 0.82;
export const UNDER_RESTING = 0.92;

export const underEntranceOpacity = (scene: QuietScene): number =>
  isDarkInk(scene) ? DARK_UNDER_FLOOR : CREAM_UNDER_FLOOR;

/** `t` runs 0 -> 1 as the under-line settles. */
export const underOpacity = (t: number, scene: QuietScene): number => {
  const floor = underEntranceOpacity(scene);
  return floor + (UNDER_RESTING - floor) * t;
};

/**
 * 🪤 THE FLOOR IS 2.2, NOT THE 3.0 READING FLOOR, AND THAT IS DELIBERATE.
 *
 * Every cut this account has shipped enters its under-line below 3.0 — stone-d
 * at 2.26:1, fold-e and threshold-f at 2.73:1 — for the 0.55s before the ramp
 * finishes. Gating at 3.0 would fail V50–V57, which must keep rendering
 * byte-for-byte as published, and "fix" four cuts nobody asked me to touch.
 * ⇒ Calibrated on what ships. This catches an under-line that is INVISIBLE
 * (a dark one handed the cream floor reads 1.56), never one that is merely
 * quiet. ⭐ Choose a floor by the failure it must catch, not by the ideal.
 */
export const MIN_UNDER_ENTRANCE_CONTRAST = 2.2;

/** The bands the under-line actually occupies — measured off real V58 renders. */
const UNDER_BANDS = [6, 7];

export const checkUnderLineEntranceAt = (scenes: QuietScene[], forceFloor?: number): Gate => {
  const bad: string[] = [];
  scenes.forEach((s, i) => {
    if (!s.under) return;
    const grounds = groundLuminances(s.bg, s.scrim);
    const bands = GROUND_BANDS[s.bg];
    if (!grounds || !bands) {
      bad.push(`scene ${i}: ground "${s.bg}" has never been measured`);
      return;
    }
    const op = forceFloor ?? underEntranceOpacity(s);
    const ink = rgb(s.fg);
    const stops = SCRIM_STOPS[s.scrim ?? "normal"];
    for (const b of UNDER_BANDS) {
      const a = scrimAlphaAt(stops, bandCentreY(b));
      const g: [number, number, number] = [
        bands[b][0] * (1 - a),
        bands[b][1] * (1 - a),
        bands[b][2] * (1 - a),
      ];
      const eff: [number, number, number] = [
        g[0] * (1 - op) + ink[0] * op,
        g[1] * (1 - op) + ink[1] * op,
        g[2] * (1 - op) + ink[2] * op,
      ];
      const c = contrastRatio(relLuminance(eff), relLuminance(g));
      if (c < MIN_UNDER_ENTRANCE_CONTRAST) {
        bad.push(`scene ${i}: under-line on ${s.bg} enters at ${c.toFixed(2)}:1`);
        break;
      }
    }
  });
  return {
    name: `every under-line is visible the moment it appears (>= ${MIN_UNDER_ENTRANCE_CONTRAST}:1)`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

export const checkUnderLineEntrance = (scenes: QuietScene[]): Gate =>
  checkUnderLineEntranceAt(scenes);

/**
 * Which scenes run the handoff. ⛔ Only the pair either side of the crossing;
 * every other scene holds its copy at full opacity, which is what keeps V50–V57
 * rendering byte-for-byte as published.
 */
export type Handoff = { fadeOut: boolean; fadeIn: boolean };

export const handoffFlags = (scenes: QuietScene[]): Handoff[] => {
  const crossings = new Set(polarityCrossings(scenes));
  return scenes.map((_, i) => ({ fadeOut: crossings.has(i), fadeIn: crossings.has(i - 1) }));
};

/**
 * 🪤 A DROP SHADOW IS A POLARITY DECISION TOO, AND IT IS EASY TO LEAVE BEHIND.
 * The dark halo under cream type is what lifts it off a photograph. Under DARK
 * type on a LIGHT ground it does nothing visible and slightly thickens the
 * letterforms; what separates dark type there is a pale halo. Shipped cuts keep
 * the exact string they rendered with.
 */
export const textShadowFor = (scene: QuietScene): string =>
  isDarkInk(scene) ? "0 10px 40px rgba(255,251,244,0.55)" : "0 14px 48px rgba(0,0,0,0.68)";

export const underShadowFor = (scene: QuietScene): string =>
  isDarkInk(scene) ? "0 6px 24px rgba(255,251,244,0.6)" : "0 8px 30px rgba(0,0,0,0.7)";

export const runQuietGates = (scenes: QuietScene[], payoffIndex: number): Gate[] => [
  checkGroundChanges(scenes),
  checkHoldDurations(scenes),
  checkDissolveFits(scenes),
  checkAccentWords(scenes),
  checkAccentContrast(scenes),
  checkTextContrast(scenes),
  checkInkPolarityHandoff(scenes),
  checkUnderLineEntrance(scenes),
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
