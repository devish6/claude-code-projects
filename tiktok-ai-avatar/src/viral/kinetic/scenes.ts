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

/**
 * No scene may hold the full frame longer than this.
 *
 * 🔴 RAISED 1.7s -> 2.2s after watching the first cut: it read as TOO FAST.
 * Turning the frame over is the point, but a scene the viewer cannot finish
 * reading is a scene they leave. The market reference cuts every 1.5-2.5s, and
 * the goal here is average watch time, not cut count - a fast cut nobody
 * finishes reading costs the very metric the format exists to move.
 */
export const KINETIC_SCENE_MAX = sec(2.2);

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
  /**
   * How the ground moves under this scene, as a scale ramp across its whole
   * duration. Omitted = the default slow 6% push every scene has always had.
   *
   * 🔴 ADDED FOR V45, AND DELIBERATELY OPTIONAL. V43 and V44 are the controls
   * for the format and must keep rendering byte-for-byte as published, so the
   * default is unchanged and neither of them sets this field.
   *
   * 🎯 WHAT IT IS FOR: a pull-IN (from > to) moves fastest at the start, so the
   * frame is visibly moving inside the first second. Measured 2026-08-23,
   * @numberswithrimzim's prediction chip over STATIC b-roll scored 29.1K
   * against @soulguidance_tanishve's 93K–232K on the same chip with motion —
   * motion at frame 1 is the visible difference between the two.
   * 🪤 This moves the GROUND only. Scene 0's type stays static: frame 0 is the
   * poster frame and has shipped blank twice.
   */
  push?: { from: number; to: number };
  /**
   * ⭐⭐⭐ THE ARTEFACT. ADDED FOR V48, AND DELIBERATELY OPTIONAL.
   *
   * 🔴 WHY IT EXISTS. Measured 2026-08-27 against the market: the biggest
   * numerology short anyone could observe in the "your name" category is a
   * FACELESS FLAT CARD WITH A LOOKUP TABLE ON IT — 3M views from a channel with
   * 13.6K subscribers. Two more faceless cards did 2.6M and 1.3M. Faceless text
   * cards are not the handicap; ABSTRACT text cards are.
   *
   * ⭐ The dividing line is USE vs INFORMATION. Every faceless winner puts a
   * complete, copyable artefact on screen in frame 0 — a table, an A–Z grid, a
   * two-step recipe. It is a TOOL: the viewer stays to read it, or leaves with a
   * screenshot, and a screenshot is a save. Our format up to V47 put a
   * STATEMENT on screen, which is finished the moment it is read. Same format,
   * opposite function.
   *
   * 📉 What the statement format costs, measured on V47: 44.9% of viewers gone
   * inside second 1, then 60.1% OF THE SURVIVORS gone inside second 2 — 78%
   * gone by 2s. And the class it belongs to is 0-for-30 at clearing 500 reach
   * across the whole 61-post window.
   *
   * 🪤 OPTIONAL, AND THAT IS LOAD-BEARING. V43 and V44 are the format's
   * controls and must keep rendering byte-for-byte as published; V45–V47 are a
   * held package. None of them sets this field, so none of their frames move.
   * The same reasoning that kept `push` optional keeps this optional.
   */
  table?: KineticTable;
};

/**
 * A compact lookup grid — headers on both axes, one short mark per cell, and at
 * most one thing lit.
 *
 * 🎯 THE LIT CELL IS THE MOTION. "Something must physically move that is not
 * text" is the third rule this primitive was built for: a card that only
 * animates its own words has no visual proposition, because the sentence and
 * the picture are the same object. A row lighting, then a column, then the one
 * cell where they cross, tells the story before the words finish.
 * ⛔ Never a face. The owner's face is dead-tested at ~700 views against
 * faceless winners at 1,268–2,408.
 */
export type KineticTable = {
  /** Small label set over the columns. */
  colTitle?: string;
  /** Small label set on its side, down the left of the rows. */
  rowTitle?: string;
  /** Column headers, left to right. */
  cols: string[];
  /** Row headers, top to bottom. */
  rows: string[];
  /** `cells[row][col]`. Must be exactly `rows.length` x `cols.length`. */
  cells: string[][];
  /**
   * The one thing that lights up. `{ row }` lights a whole row, `{ col }` a
   * whole column, `{ row, col }` the single cell where they cross.
   * 🪤 Omitted on scene 0 on purpose — see `assertKineticRenderable`'s note on
   * the poster frame. Nothing may animate there.
   */
  highlight?: { row?: number; col?: number };
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

/**
 * 🔴 THE ARTEFACT MUST BE A RECTANGLE, AND ITS LIT CELL MUST EXIST.
 *
 * A ragged `cells` array does not throw — React renders the short row and the
 * grid silently loses a column, which is the same class of failure as the blank
 * frame 0: the render "works" and the frame is wrong. An out-of-range highlight
 * is worse, because it lights nothing at all and the scene's one moving thing
 * quietly stops moving.
 *
 * 🪤 VACUOUS BY DESIGN FOR EVERY CUT BEFORE V48. No V43–V47 scene sets `table`,
 * so this gate passes them without looking at anything — which is exactly why
 * adding it to `runKineticGates` cannot change a single published frame.
 */
export const checkTableShape = (scenes: KineticScene[]): Gate => {
  const bad: string[] = [];
  scenes.forEach((s, i) => {
    const t = s.table;
    if (!t) return;
    if (t.cells.length !== t.rows.length) {
      bad.push(`scene ${i}: ${t.cells.length} row(s) of cells for ${t.rows.length} row header(s)`);
    }
    t.cells.forEach((row, r) => {
      if (row.length !== t.cols.length) {
        bad.push(`scene ${i} row ${r}: ${row.length} cell(s) for ${t.cols.length} column(s)`);
      }
    });
    const h = t.highlight;
    if (!h) return;
    if (h.row === undefined && h.col === undefined) bad.push(`scene ${i}: highlight lights nothing`);
    if (h.row !== undefined && (h.row < 0 || h.row >= t.rows.length)) {
      bad.push(`scene ${i}: highlight row ${h.row} is outside 0..${t.rows.length - 1}`);
    }
    if (h.col !== undefined && (h.col < 0 || h.col >= t.cols.length)) {
      bad.push(`scene ${i}: highlight column ${h.col} is outside 0..${t.cols.length - 1}`);
    }
  });
  return {
    name: "every table is a full rectangle and lights a cell that exists",
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
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

/**
 * How a scene's copy arrives, at frame `f` of that scene's own Sequence.
 *
 * 🔴 LIFTED OUT OF `Scene` ON PURPOSE. Three times now this repo has shipped a
 * frame nobody could check because the rule that produced it was computed
 * inside the component's render body. `spreadTraits` and `planViralVideo` were
 * the first two. This is the third.
 */
export const sceneEntrance = (f: number, isFirst: boolean): { opacity: number; lift: number } => {
  if (isFirst) return { opacity: 1, lift: 0 };
  const ramp = (to: number) => (f >= to ? 1 : f <= 0 ? 0 : f / to);
  // ⛔ NEVER RAMP THIS FROM 0. The copy is what lights a dark ground, so a
  // fade-in from zero renders the cut frame black — measured at 0.19%
  // non-black on the published V48. The slide below is the entrance; the
  // opacity is a hard cut, which is what this format says it is.
  return { opacity: 1, lift: 16 - 16 * ramp(7) };
};

export const runKineticGates = (scenes: KineticScene[], payoffIndex: number): Gate[] => [
  checkFrameChanges(scenes),
  checkSceneDurations(scenes),
  checkPayoffLate(scenes, payoffIndex),
  checkTableShape(scenes),
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
