import type { Caption } from "@remotion/captions";

import { captionsDurationMs, captionsFromText } from "../../internal/captions/captions-from-text";
import { FPS, sec } from "../timing";
import { contrastRatio, groundLuminances, relLuminance, type Gate } from "../quiet/scenes";

/**
 * The SPOKEN scene model — a THIRD format, for a cut whose prose is LIT rather
 * than held.
 *
 * ⭐⭐⭐ WHY A THIRD FORMAT AND NOT AN EIGHTH QUIET CUT. The owner ruled on
 * 2026-09-12 to change format after V60 measured 168 TikTok views at ~33h
 * against the quiet format's 607-653 band.
 *
 * ⚠️ AND THE HONEST PROVENANCE OF THAT RULING, BECAUSE IT WILL BE MISREAD LATER:
 * 168 is about ONE SIGMA. σ of log₁₀(views) on this account is ≈0.6 with the
 * creative held constant, so one sigma is a factor of four and 630/168 = 3.75 —
 * and V56 had already produced 154 INSIDE the quiet format. ⛔ Do not cite V60's
 * 168 as proof the quiet format broke. This format exists because the owner
 * decided to change, which is his call to make; it is not an evidence-forced
 * conclusion. `docs/specs/2026-09-12-spoken-format-design.md` records both.
 *
 * ── WHAT IS ACTUALLY DIFFERENT ──────────────────────────────────────────────
 * Quiet holds ONE static sentence per ground in Cormorant at 100-132px, centred,
 * with an under-line settling beneath it. This format runs continuous prose as
 * word-lit caption pages in Inter 800 at 74px. Frame 0 is therefore a different
 * object, and so is every frame after it.
 *
 * 🔴 LOCKED TO THE PHRASE REGISTER, AND THE BAN IS STRUCTURAL.
 * `build-story-captions.mjs` already ruled against word-by-word IN WRITING here
 * — *"the eye is yanked ~3x/second and the sentence never exists as a whole"* —
 * and `CaptionDemo.tsx` states the `loud` preset exists *"to prove it is
 * buildable, not to recommend it."* The kinetic register it belongs to measured
 * 2,790-3,289 ms average watch against quiet's 7,745-7,988. `checkPageRegister`
 * enforces that as a gate rather than a comment, so it cannot be "improved" back
 * in by someone who has not read this paragraph.
 *
 * ⭐⭐⭐ AND THE CAPACITY CORRECTION, WHICH IS THE OPPOSITE OF THE INTUITION.
 * This format was first argued for on the grounds that it lifts the ~300-word
 * Instagram caption onto the video, since quiet's `MAX_WORDS` caps a beat at 11.
 * That is FALSE. **Static text is read in PARALLEL; captions are read
 * SERIALLY.** A quiet beat shows an 8-word line AND a 7-word under-line together
 * for 2.7s, so V60 displays ~90 words in 16.4s ≈ 5.5 words/sec. Caption pages at
 * this register run ~2.75 words/sec. ⇒ At equal length this format carries about
 * HALF a quiet cut's prose. The writing must get TIGHTER, not looser, and more
 * words costs runtime — which is not a lever in either direction
 * (`content/v54-measured.md`: runtime moved 87%, attention flat).
 *
 * ── WHAT THIS IMPORTS, AND WHAT IT MUST NEVER TOUCH ─────────────────────────
 * ⛔ From `../quiet/scenes` it takes ONLY the scrim/luminance model and the
 * `Gate` type. It imports NOTHING from `../kinetic/`, and it MODIFIES neither.
 * V43-V49 and V50-V60 must keep rendering byte-for-byte as published; they are
 * the only controls this account owns.
 *
 * ⭐ Reusing `GROUND_BANDS` (via `groundLuminances`) is correct rather than
 * merely convenient: the caption block at 74px over ~3 lines centres to roughly
 * y 830..1090, which lies inside the y 700..1220 strip that band data already
 * measures. It is literally the same legibility question.
 */

/** A hold must be long enough to carry its own prose without rushing it. */
export const SPOKEN_SCENE_MIN = sec(2.5);

/**
 * ...and short enough that the frame still changes. 🔴 These are NOT quiet's
 * 2.0-4.0s bounds: a scene here carries a whole clause as several caption pages,
 * so it legitimately runs longer. Copying quiet's ceiling would have forced the
 * prose into fragments, which is the `loud` register arriving through the back
 * door.
 */
export const SPOKEN_SCENE_MAX = sec(5.5);

/** How long one ground dissolves into the next. Inherited from quiet deliberately. */
export const DISSOLVE = sec(0.5);

/** The push is slow — the frame should breathe, not move. */
export const GROUND_DRIFT = 0.045;

/** The grouping window: tokens starting within this of a page's first word share it. */
export const PAGE_MS = 1500;

/** Authored cadence. There is no audio, so this is a creative choice, not a measurement. */
export const DEFAULT_WPS = 2.75;

/**
 * Held after the last page so the closing words do not evaporate before the shot
 * does. The final page is rendered UNCAPPED, so this is dwell on fully-populated
 * type, never a bare plate.
 */
export const TAIL = sec(0.3);

/** A tail longer than this is a plate sitting there with nothing happening. */
export const TAIL_MAX = sec(1.0);

export const MIN_PAGE_WORDS = 3;

/** Frame 0 is the poster frame; a two-word fragment is not a hook. */
export const MIN_FIRST_PAGE_WORDS = 4;

export const MIN_TEXT_CONTRAST = 3.0;

/** An accent that matches its own ink is not an accent. Quiet's number, same reason. */
export const MIN_ACCENT_DISTANCE = 60;

export type SpokenScene = {
  /** The photographic ground. Adjacent scenes MUST differ — see the gate. */
  bg: string;
  /** Foreground ink: the unlit words of a page. */
  fg: string;
  /** The colour of the word currently being lit. */
  accent: string;
  /** The prose this ground carries. One or two sentences. */
  text: string;
  /**
   * How hard to darken the ground. 🔴 CONSTANT ACROSS A CUT — see
   * `checkConstantScrim`. A per-scene scrim applied to a luma ladder is a
   * ladder-flattening operation by construction.
   */
  scrim?: "light" | "normal" | "heavy";
  /** Override the authored cadence for this scene only. */
  wordsPerSecond?: number;
};

/** `#RRGGBB` -> [r,g,b]. Quiet keeps its own copy module-private. */
const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

// ── The derivation. Everything below is what the component renders from. ─────

export const sceneCaptions = (scene: SpokenScene): Caption[] =>
  captionsFromText(scene.text, { wordsPerSecond: scene.wordsPerSecond ?? DEFAULT_WPS });

/**
 * ⭐⭐⭐⭐ PAGING IS DONE HERE, NOT BY `createTikTokStyleCaptions`, AND THAT IS A
 * BUG FIX RATHER THAN A PREFERENCE.
 *
 * 🔴 THE DEFECT, MEASURED ON THE REAL CUT: `createTikTokStyleCaptions` groups
 * PURELY BY TIME, which this repo already warned about — *"a phrase page can
 * straddle a sentence boundary"*, and `build-story-captions.mjs` solves it by
 * breaking on punctuation. Run against V61's own prose at a 1500ms window it
 * produced **three orphan pages**: scene 0 page 2 with ONE word ("loud."),
 * scene 3 page 2 with two, scene 4 page 2 with one.
 *
 * ⇒ A one-word page IS the `loud` register — the exact thing `checkPageRegister`
 * exists to ban — arriving by accident at the end of a scene. ⛔ AND THE FIX IS
 * NOT TO TUNE `PAGE_MS` UNTIL THE GATE PASSES: widening the window from 1150 to
 * 1500 did not remove orphans, it only moved which scenes had them. Tuning a
 * constant until a gate goes green is how this repo shipped a flattened luma
 * ladder and is explicitly forbidden for `qa:frame`'s floors.
 *
 * So a short page is MERGED into its neighbour. Walking from the END matters: a
 * trailing orphan belongs to the clause it fell off, so it folds backwards.
 *
 * 🪤 A scene whose whole prose is shorter than `MIN_PAGE_WORDS` still fails
 * `checkPageRegister`, because there is no neighbour to merge into. That is
 * correct — a two-word scene is not a beat in this format.
 */
/**
 * 🔴🔴🔴 PAGES BREAK ON SENTENCES, NOT ON TIME — AND THIS IS THE SECOND FIX,
 * BECAUSE THE FIRST ONE SHIPPED A CUT THAT SAID THE OPPOSITE OF WHAT IT MEANT.
 *
 * The first version grouped tokens inside a `PAGE_MS` window and merged short
 * pages. Every gate passed. Then the render was LOOKED AT, and the payoff frame
 * read:
 *
 *                      "it made you who you are."
 *
 * The line is "I won't tell you it made you who you are." The window split the
 * negation from its object, so for ~2 seconds the largest text on screen was
 * EXACTLY THE CONSOLATION THE CUT EXISTS TO REFUSE. The same split made frame 0
 * — the poster frame — the fragment "You were the one who".
 *
 * ⭐⭐⭐⭐ A TIME WINDOW HAS NO IDEA WHERE A THOUGHT ENDS. `build-story-captions.mjs`
 * already knew this and broke on punctuation; this file had to learn it twice.
 * ⛔ Do not reintroduce time-based grouping "to balance page lengths" — the
 * balance is worth nothing if a page can inverte the sentence's meaning.
 *
 * A sentence too long for `MAX_PAGE_LINES` is a FAILURE (`checkPageFits`), not a
 * reason to split it: the author shortens the line.
 */
const SENTENCE_END = /[.!?]["')\]]?$/;

const groupBySentence = (caps: Caption[]): Caption[][] => {
  const groups: Caption[][] = [];
  for (const c of caps) {
    if (groups.length === 0) groups.push([]);
    groups[groups.length - 1].push(c);
    if (SENTENCE_END.test(c.text.trim())) groups.push([]);
  }
  return groups.filter((g) => g.length > 0);
};

const mergeShortPages = (groups: Caption[][]): Caption[][] => {
  const out = groups.map((g) => [...g]);
  for (let i = out.length - 1; i >= 0 && out.length > 1; i--) {
    if (out[i].length >= MIN_PAGE_WORDS) continue;
    if (i > 0) {
      out[i - 1].push(...out[i]);
      out.splice(i, 1);
    } else {
      // The FIRST page is short: it has no predecessor, so it folds forward.
      out[1].unshift(...out[0]);
      out.splice(0, 1);
      break;
    }
  }
  return out;
};

/**
 * The pages, as the renderer will draw them. ⭐ ONE function, so the gates below
 * and `SpokenVideo` read the same layout. This repo has paid three times for a
 * rule computed inside a component that nothing outside it could reproduce.
 *
 * ⚠️⚠️ AND THE COST OF THAT CHOICE, STATED WHERE IT CANNOT BE SKIPPED. The QA
 * rule in `.claude/skills/qa` cuts the other way: *"a gate over the builder
 * cannot catch the builder being wrong — the queue and the assertion call the
 * same function, so it agrees with itself while the output is wrong."* Every
 * page gate below calls THIS function, so they can prove the pages are
 * well-formed and can NEVER prove the paging rule itself is right. If
 * `mergeShortPages` merged the wrong way, or a page's start time were off by a
 * dissolve, every gate here would stay green.
 *
 * ⇒ The only checks with authority over that are the ones that read pixels off
 * the encoded file — `qa:frame` across every frame, and a person watching it.
 * Sampling frames is not watching.
 */
export const scenePageCaptions = (scene: SpokenScene): Caption[][] =>
  mergeShortPages(groupBySentence(sceneCaptions(scene)));

/** Words on a page, ignoring the whitespace that lives inside each token. */
export const pageWords = (page: Caption[]): number =>
  page.filter((c) => c.text.trim().length > 0).length;

export const pageText = (page: Caption[]): string => page.map((c) => c.text).join("");

/** Frames the prose itself occupies. */
export const sceneCaptionFrames = (scene: SpokenScene): number =>
  Math.ceil((captionsDurationMs(sceneCaptions(scene)) / 1000) * FPS);

/**
 * 🔴 THE HOLD IS DERIVED, NEVER AUTHORED — and that is a correctness choice.
 *
 * Quiet authors `seconds` per scene by hand. Here the prose decides how long its
 * own ground is on screen. Authoring both independently lets them disagree, and
 * the failure is SILENT in both directions: a hold shorter than its prose
 * guillotines a phrase at the dissolve, and a hold longer than its prose leaves
 * the plate sitting there. Deriving makes them agree by construction, and
 * `checkPagesTileScene` gates the derivation with a positive control.
 *
 * ⛔ It is deliberately NOT clamped into [MIN, MAX]. A silent clamp would hide
 * over-long prose behind a truncated render; `checkHoldDurations` fails instead,
 * and the author shortens the line — which is the correct fix.
 */
export const sceneFrames = (scene: SpokenScene): number => sceneCaptionFrames(scene) + TAIL;

export const totalFrames = (scenes: SpokenScene[]): number =>
  scenes.reduce((a, s) => a + sceneFrames(s), 0);

export const sceneOffsets = (scenes: SpokenScene[]): number[] => {
  const out: number[] = [];
  let f = 0;
  for (const s of scenes) {
    out.push(f);
    f += sceneFrames(s);
  }
  return out;
};

/**
 * Ground opacity at frame `f` of its own scene.
 *
 * 🔴🔴 THE CROSS-DISSOLVE IS THE BLACK-FRAME FIX, NOT A STYLE. Scene N+1 fades
 * IN underneath scene N fading OUT, so total ground opacity is ~1 at every frame
 * of the transition and there is no instant where nothing is lit. Kinetic got a
 * mean-luma-7.05 frame at its payload beat precisely because its copy — the only
 * bright thing on a dark ground — ramped from 0 at each hard cut.
 *
 * 🪤 `isFirst` returns a hard 1: frame 0 is the poster frame and this repo has
 * shipped it blank TWICE. 🪤 `isLast` must not out-ramp either — it has no
 * successor fading in beneath it, so an out-ramp would dissolve the ask into
 * black. V50's first render ended at mean luma 9.4 for exactly that reason.
 * ⭐ The invariant is "every fade has a partner", not "fades are fine".
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

// ── Gates ────────────────────────────────────────────────────────────────────

/**
 * A dissolve between two identical grounds is a 0.5s cross-fade that produces no
 * visible change at all — the worse version of the invisible cut.
 */
export const checkGroundChanges = (scenes: SpokenScene[]): Gate => {
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

export const checkHoldDurations = (scenes: SpokenScene[]): Gate => {
  const bad = scenes
    .map((s, i) => ({ i, f: sceneFrames(s) }))
    .filter(({ f }) => f > SPOKEN_SCENE_MAX || f < SPOKEN_SCENE_MIN)
    .map(({ i, f }) => `scene ${i} = ${f}f`);
  return {
    name: `every derived hold within [${SPOKEN_SCENE_MIN}, ${SPOKEN_SCENE_MAX}] frames`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * 🔴 A DISSOLVE MUST FIT INSIDE THE SCENE IT LEAVES. Otherwise the outgoing
 * ground is still fading while the next is already fading out: the frame is a
 * permanent average of two photographs and never resolves to either. It renders
 * as mud, and no gate downstream notices because every frame is "populated".
 *
 * 🪤 IN PRACTICE `checkHoldDurations` BINDS FIRST — its floor of
 * `SPOKEN_SCENE_MIN` is far above `DISSOLVE * 2`, so no realistic prose reaches
 * this gate. It is kept because the two express different rules and the floor is
 * a content decision that may move; its positive control therefore calls it with
 * a synthetic one-word scene rather than a plausible one.
 */
export const checkDissolveFits = (scenes: SpokenScene[]): Gate => {
  const bad = scenes
    .map((s, i) => ({ i, f: sceneFrames(s) }))
    .filter(({ f }) => f <= DISSOLVE * 2)
    .map(({ i, f }) => `scene ${i} = ${f}f vs dissolve ${DISSOLVE}f`);
  return {
    name: `every hold is longer than two dissolves (${DISSOLVE * 2}f)`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * ⭐⭐⭐ THE PAGES MUST TILE THEIR OWN SCENE — the gate that guards the
 * derivation above. Catches a phrase guillotined by the dissolve (hold shorter
 * than its prose) and a plate left sitting with nothing happening (tail too
 * long). Both are invisible to every other gate here.
 */
export const checkPagesTileScene = (scenes: SpokenScene[]): Gate => {
  const bad: string[] = [];
  scenes.forEach((s, i) => {
    const prose = sceneCaptionFrames(s);
    const hold = sceneFrames(s);
    if (hold < prose) bad.push(`scene ${i}: hold ${hold}f is shorter than its prose ${prose}f`);
    if (hold - prose > TAIL_MAX) {
      bad.push(`scene ${i}: ${hold - prose}f of bare plate after the prose (max ${TAIL_MAX}f)`);
    }
    if (scenePageCaptions(s).length === 0) bad.push(`scene ${i}: no caption pages at all`);
  });
  return {
    name: "every scene's caption pages cover its hold, with no bare tail",
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * 🔴 THE REGISTER GATE. A single-word page IS the `loud` register, which this
 * repo ruled against in writing. Enforced mechanically because the one-line edit
 * that breaks it looks identical to the lines that keep it — and because the
 * time-based pager produced three of them on this very cut before `mergeShortPages`
 * existed.
 */
export const checkPageRegister = (scenes: SpokenScene[]): Gate => {
  const bad: string[] = [];
  scenes.forEach((s, i) => {
    scenePageCaptions(s).forEach((p, j) => {
      const words = pageWords(p);
      if (words < MIN_PAGE_WORDS) {
        bad.push(`scene ${i} page ${j}: ${words} word(s), minimum ${MIN_PAGE_WORDS}`);
      }
    });
  });
  return {
    name: `every caption page carries at least ${MIN_PAGE_WORDS} words`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * 🔴🔴 FRAME 0 IS THE POSTER FRAME, AND THIS GATE WAS NAMED FOR A CHECK IT DID
 * NOT PERFORM — the `checkTraitParity` failure, repeated.
 *
 * It used to assert a WORD COUNT and call itself "complete". Frame 0 of the
 * first render read "You were the one who" — five words, so it passed, and it is
 * a trailing fragment. ⇒ Completeness is TERMINAL PUNCTUATION: the poster frame
 * must carry a whole sentence, not merely enough words. The word floor is kept
 * as a second, weaker condition.
 */
export const checkFirstPageComplete = (scenes: SpokenScene[]): Gate => {
  const first = scenes[0] ? scenePageCaptions(scenes[0])[0] : undefined;
  const words = first ? pageWords(first) : 0;
  const text = first ? pageText(first).trim() : "";
  const whole = SENTENCE_END.test(text);
  return {
    name: `the poster frame carries a COMPLETE sentence of at least ${MIN_FIRST_PAGE_WORDS} words`,
    ok: whole && words >= MIN_FIRST_PAGE_WORDS,
    detail: whole ? `first page has ${words} word(s)` : `first page is a fragment: "${text}"`,
  };
};

/**
 * ⭐ NO PAGE MAY END MID-SENTENCE. The gate that would have caught the payoff
 * inversion before it rendered.
 */
export const checkPagesAreWholeSentences = (scenes: SpokenScene[]): Gate => {
  const bad: string[] = [];
  scenes.forEach((s, i) => {
    scenePageCaptions(s).forEach((p, j) => {
      const t = pageText(p).trim();
      if (!SENTENCE_END.test(t)) bad.push(`scene ${i} page ${j} ends mid-sentence: "${t}"`);
    });
  });
  return {
    name: "every page is a whole sentence, so no page can invert the line's meaning",
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/**
 * ⚠️⚠️ A PROXY, AND IT SAYS SO. A unit test cannot lay out text, so this cannot
 * be trusted the way `checkTextContrast` can.
 *
 * The failure it exists for: V60's ask accent rendered **963px against an 860px
 * box**, reaching 68px from the right edge — under TikTok's action rail — and
 * every gate was green. That mechanism was `whiteSpace: nowrap` and CANNOT recur
 * here, because caption pages use `textWrap: "balance"` and wrap freely. What
 * remains possible is a single word too long to fit any line, or a page so long
 * it grows past three lines and pushes into the platform's caption band.
 *
 * ⇒ Both are estimated from character counts at the known 74px size. The
 * rendered ask frame must STILL be measured by hand. A gate that cannot fail the
 * way the real operation fails is not a gate; this one is documented as partial
 * rather than believed.
 */
export const SAFE_WIDTH = 1080 - 2 * 70;
/** Inter 800 at 74px averages ~0.52em of advance per character. */
export const CHARS_PER_LINE = Math.floor(SAFE_WIDTH / (74 * 0.52));
export const MAX_PAGE_LINES = 3;

export const checkPageFits = (scenes: SpokenScene[]): Gate => {
  const bad: string[] = [];
  scenes.forEach((s, i) => {
    scenePageCaptions(s).forEach((p, j) => {
      const text = pageText(p).trim();
      const longest = text.split(/\s+/).reduce((m, w) => Math.max(m, w.length), 0);
      if (longest > CHARS_PER_LINE) {
        bad.push(`scene ${i} page ${j}: a ${longest}-char word cannot fit ${CHARS_PER_LINE}`);
      }
      const lines = Math.ceil(text.length / CHARS_PER_LINE);
      if (lines > MAX_PAGE_LINES) {
        bad.push(`scene ${i} page ${j}: ~${lines} lines, over ${MAX_PAGE_LINES}`);
      }
    });
  });
  return {
    name: `every page fits ${MAX_PAGE_LINES} lines of ~${CHARS_PER_LINE} chars inside the safe box`,
    ok: bad.length === 0,
    detail: bad.length ? bad.join(", ") : undefined,
  };
};

/** An accent the same colour as the ink is not an accent. */
export const checkAccentContrast = (scenes: SpokenScene[]): Gate => {
  const bad = scenes
    .map((s, i) => {
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
 * ⭐⭐⭐⭐ THE INK AND THE LIT WORD, MEASURED AGAINST THE PHOTOGRAPH THEY SIT ON,
 * at EVERY band of the block rather than on average.
 *
 * 🔴 THE ACCENT IS THE BINDING CONSTRAINT, NOT THE INK. The spec sized the
 * brightest plate at 145 by checking cream only. Cream (relLum 0.932) clears
 * 3.0:1 up to ~142 post-scrim; the gold accent (relLum 0.504) only clears to
 * ~103. So the accent, not the ink, sets the ceiling on a warm plate.
 *
 * ⚠️ CORRECTION — an earlier version of this comment claimed that "raising the
 * accent towards cream fixes the contrast and then fails `checkAccentContrast`'s
 * 60-channel distance". **That is FALSE and it was asserted rather than
 * computed.** A pale amber `#FFD9A0` against cream `#FFF6EA` measures 74 in the
 * blue channel and passes the 60 floor comfortably. A lighter accent IS
 * available; it simply was not needed once the plates were measured. ⭐ Compute
 * the number before writing it down as a constraint.
 *
 * ⭐⭐⭐⭐ AND THE REAL LESSON, MEASURED ON THE PLATES: THE STRIP MEAN IS NOT THE
 * CONSTRAINT — THE BRIGHTEST BAND IS. `lamp-i` at a strip mean of 101.9 sat
 * comfortably inside its 100-120 target and STILL failed at 2.72:1, because its
 * lamp pool is low in frame and band 7 measured ~128. Regraded to a mean of
 * 89.6 it clears; at 93.5 it measures 2.98:1 and fails by two hundredths. ⇒ A
 * plate is judged band by band, so "it hit its target mean" proves nothing.
 *
 * 🔴 AN UNMEASURED GROUND IS A FAILURE, NOT A SKIP. Add a plate, re-run
 * `scripts/measure-grounds.mjs`.
 */
export const checkTextContrast = (scenes: SpokenScene[]): Gate => {
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
    const acc = worst(s.accent);
    if (acc < MIN_TEXT_CONTRAST) {
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
 * 🔴 A CONSTANT SCRIM, BECAUSE A PER-SCENE ONE FLATTENS THE LADDER BY
 * CONSTRUCTION. V58 assigned `heavy` to its bright plates and `light` to its
 * dark ones to keep type legible, which darkens exactly the plates whose
 * brightness was the point: a designed 191->155->137->95->44->56 rendered as
 * 87->76->**97**->73->47->57 and scene 3 became the brightest frame in the cut.
 * Nothing was misjudged; the mechanism guarantees it.
 */
export const checkConstantScrim = (scenes: SpokenScene[]): Gate => {
  const used = new Set(scenes.map((s) => s.scrim ?? "normal"));
  return {
    name: "one scrim across the whole cut, so it cannot flatten the ladder",
    ok: used.size <= 1,
    detail: used.size > 1 ? `scrims used: ${[...used].join(", ")}` : undefined,
  };
};

/**
 * ⭐ Relative luminance of the ink, used only to classify polarity. The split is
 * nowhere near any ink in use: cream sits above 0.8, dark ink below 0.02.
 */
export const DARK_INK_BELOW = 0.35;

export const isDarkInk = (scene: SpokenScene): boolean =>
  relLuminance(rgb(scene.fg)) < DARK_INK_BELOW;

/**
 * 🔴🔴 THIS FORMAT REQUIRES ONE INK POLARITY THROUGHOUT, AND THE REASON IS THAT
 * IT HAS NO HANDOFF MECHANISM.
 *
 * Quiet can flip ink once because `copyOpacity` hands the two overlapping copies
 * through a deliberate text-free beat, and `checkInkPolarityHandoff` refuses a
 * crossing over any ground too dark to carry that beat alone. Nothing here does
 * that: caption pages cross-fade at full opacity, so opposite-coloured pages
 * would stack — dark lettering on top of cream lettering — which is the glitch
 * predicted for V58 the moment a light plate entered the library.
 *
 * ⇒ Zero crossings, enforced. A future cut that wants a flip must BUILD the
 * handoff first, not relax this gate.
 */
export const polarityCrossings = (scenes: SpokenScene[]): number[] =>
  scenes
    .map((_, i) => i)
    .slice(0, -1)
    .filter((i) => isDarkInk(scenes[i]) !== isDarkInk(scenes[i + 1]));

export const checkSingleInkPolarity = (scenes: SpokenScene[]): Gate => {
  const crossings = polarityCrossings(scenes);
  return {
    name: "ink polarity never changes (this format has no handoff for it)",
    ok: crossings.length === 0,
    detail: crossings.length ? `crossings after scene ${crossings.join(", ")}` : undefined,
  };
};

/**
 * The distribution gate is average watch time, so the cut must still be paying
 * at 6.4s. `payoffIndex` is the beat the whole thing is built to reach.
 */
export const checkPayoffLate = (
  scenes: SpokenScene[],
  payoffIndex: number,
  minSeconds = 6.4,
): Gate => {
  const startFrames = scenes.slice(0, payoffIndex).reduce((a, s) => a + sceneFrames(s), 0);
  const start = startFrames / FPS;
  return {
    name: `payoff lands at or after ${minSeconds}s`,
    ok: start >= minSeconds,
    detail: `payoff starts at ${start.toFixed(2)}s`,
  };
};

export const runSpokenGates = (scenes: SpokenScene[], payoffIndex: number): Gate[] => [
  checkGroundChanges(scenes),
  checkHoldDurations(scenes),
  checkDissolveFits(scenes),
  checkPagesTileScene(scenes),
  checkPageRegister(scenes),
  checkFirstPageComplete(scenes),
  checkPagesAreWholeSentences(scenes),
  checkPageFits(scenes),
  checkAccentContrast(scenes),
  checkTextContrast(scenes),
  checkConstantScrim(scenes),
  checkSingleInkPolarity(scenes),
  checkPayoffLate(scenes, payoffIndex),
];

/** Throws before frame 1, the way the other two formats do. */
export const assertSpokenRenderable = (
  id: string,
  scenes: SpokenScene[],
  payoffIndex: number,
): void => {
  const failed = runSpokenGates(scenes, payoffIndex).filter((g) => !g.ok);
  if (failed.length === 0) return;
  throw new Error(
    `${id} is not renderable:\n` +
      failed.map((g) => `  ✗ ${g.name}${g.detail ? ` — ${g.detail}` : ""}`).join("\n"),
  );
};

export { FPS };
