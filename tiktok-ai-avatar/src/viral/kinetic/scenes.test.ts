import { describe, expect, test } from "vitest";

import { sec } from "../timing";
import {
  KINETIC_SCENE_MAX,
  KINETIC_SCENE_MIN,
  type KineticScene,
  assertKineticRenderable,
  checkFrameChanges,
  checkPayoffLate,
  checkSceneDurations,
  sceneEntrance,
  sceneOffsets,
  totalFrames,
  tableLit,
} from "./scenes";
import { V43_SCENES, V43_PAYOFF_INDEX } from "./v43-moolank-1";
import { KINETIC_MUSIC } from "./KineticVideo";

const scene = (seconds: number, bg: string): KineticScene => ({ seconds, bg, fg: "#fff" });

describe("checkFrameChanges — the gate SCENE_CHANGE could not be", () => {
  /**
   * 🔴 THE POSITIVE CONTROL, AND THE WHOLE REASON THIS FILE EXISTS.
   *
   * This is the V-series shape: one palette, held for the entire video, with
   * only the text swapping on top. `SCENE_CHANGE` passed it every time because
   * it measured the copy. Nine posts shipped that way and the last six averaged
   * 2.66-4.04s of watch time against a ~6.4s distribution gate.
   *
   * ⛔ If this test ever goes green, the gate has stopped gating.
   */
  test("FAILS on the old format — one background held across every cut", () => {
    const vSeries = [
      scene(1.2, "sage-gold"),
      scene(1.4, "sage-gold"),
      scene(1.3, "sage-gold"),
      scene(1.5, "sage-gold"),
    ];
    const gate = checkFrameChanges(vSeries);
    expect(gate.ok).toBe(false);
    // every boundary is invisible, not just one
    expect(gate.detail).toContain("3 invisible cut(s)");
  });

  test("fails on a single repeat buried in an otherwise varied run", () => {
    const almost = [scene(1.2, "#a"), scene(1.2, "#b"), scene(1.2, "#b"), scene(1.2, "#c")];
    expect(checkFrameChanges(almost).ok).toBe(false);
    expect(checkFrameChanges(almost).detail).toContain("1 invisible cut");
  });

  test("passes when every neighbour differs", () => {
    expect(checkFrameChanges([scene(1.2, "#a"), scene(1.2, "#b"), scene(1.2, "#a")]).ok).toBe(true);
  });

  test("a non-adjacent repeat is legal — a colour may return later", () => {
    // Reusing a colour four scenes on is a motif, not an invisible cut.
    const withMotif = [scene(1.2, "#a"), scene(1.2, "#b"), scene(1.2, "#c"), scene(1.2, "#a")];
    expect(checkFrameChanges(withMotif).ok).toBe(true);
  });
});

describe("checkSceneDurations", () => {
  test("fails a scene that overstays the full-frame ceiling", () => {
    const long = [scene(1.2, "#a"), scene(KINETIC_SCENE_MAX / 30 + 0.2, "#b")];
    expect(checkSceneDurations(long).ok).toBe(false);
  });

  test("fails a scene too brief to read", () => {
    const blink = [scene(1.2, "#a"), scene(KINETIC_SCENE_MIN / 30 - 0.2, "#b")];
    expect(checkSceneDurations(blink).ok).toBe(false);
  });

  test("passes the legal band", () => {
    expect(checkSceneDurations([scene(1.0, "#a"), scene(1.7, "#b")]).ok).toBe(true);
  });
});

describe("checkPayoffLate — the V42 defect, as a rule", () => {
  /**
   * V42 put the answer in the hook ("IT'S 1 AND 7") and on the cover, so the
   * payload was complete at frame 0. Holds went 62.8% (1s) -> 35.2% (2s) ->
   * 19.0% (3s) -> 11.4% (5s) and the post averaged 2.66s.
   */
  test("FAILS when the payoff lands early, the way V42's did", () => {
    const early = [scene(1.2, "#a"), scene(1.2, "#b"), scene(1.2, "#c")];
    const gate = checkPayoffLate(early, 2);
    expect(gate.ok).toBe(false);
    expect(gate.detail).toContain("2.40s");
  });

  test("passes when the loop stays open past the watch-time gate", () => {
    const late = Array.from({ length: 8 }, (_, i) => scene(1.2, `#${i}`));
    expect(checkPayoffLate(late, 6).ok).toBe(true);
  });
});

describe("V43 — Moolank 1, the first kinetic cut", () => {
  test("renders: all gates pass", () => {
    expect(() => assertKineticRenderable("V43", V43_SCENES, V43_PAYOFF_INDEX)).not.toThrow();
  });

  test("every cut changes the whole frame", () => {
    expect(checkFrameChanges(V43_SCENES).ok).toBe(true);
  });

  test("the payoff is withheld past 6.4s — the distribution gate", () => {
    const gate = checkPayoffLate(V43_SCENES, V43_PAYOFF_INDEX);
    expect(gate.ok).toBe(true);
  });

  test("sits in a sane duration band", () => {
    // V36 won at 19.65s, but the gate is average WATCH TIME, not completion,
    // so a slower, readable cut is allowed to run longer than the old format.
    const seconds = totalFrames(V43_SCENES) / 30;
    expect(seconds).toBeGreaterThan(17);
    expect(seconds).toBeLessThan(26);
  });

  test("carries a music bed — the first kinetic cut shipped silent", () => {
    expect(KINETIC_MUSIC).toBeTruthy();
    expect(KINETIC_MUSIC).toMatch(/^music\/.+\.mp3$/);
  });

  test("no scene is too fast to read", () => {
    // The owner called the first cut "a tad bit too fast". Nothing under 1.5s.
    for (const s of V43_SCENES) expect(s.seconds).toBeGreaterThanOrEqual(1.5);
  });

  test("the frame turns over at least 10 times", () => {
    // V42 turned the full frame over ZERO times in 19.6s.
    expect(V43_SCENES.length).toBeGreaterThanOrEqual(10);
  });

  test("offsets are contiguous and start at 0", () => {
    const offs = sceneOffsets(V43_SCENES);
    expect(offs[0]).toBe(0);
    for (let i = 1; i < offs.length; i++) {
      expect(offs[i]).toBe(offs[i - 1] + sec(V43_SCENES[i - 1].seconds));
    }
  });

  /**
   * 🪤 The first render put "4 NUMBERS" on screen at 1.5s, in a video whose
   * answer is 1, 2, 4 and 7. A bare numeral in a COUNT is indistinguishable
   * from a numeral in the ANSWER — the typography hands the viewer a wrong
   * answer. Only the reveal scenes may show a digit, via `digit`.
   *
   * ⚠️ A DATE IS NOT AN ANSWER NUMERAL. The first version of this test flagged
   * "BORN 1st, 10th, 19th OR 28th?" — the birthdate cue, which the market read
   * identifies as the single strongest signal in the niche and which must stay.
   * Ordinals are stripped before the check; bare digits are what matter.
   */
  const bareNumerals = (text?: string) =>
    /\d/.test((text ?? "").replace(/\b\d+(st|nd|rd|th)\b/g, ""));

  test("POSITIVE CONTROL — the shipped bug still fails this check", () => {
    expect(bareNumerals("4 NUMBERS")).toBe(true);
    expect(bareNumerals("BORN 1st, 10th, 19th OR 28th?")).toBe(false);
    expect(bareNumerals("FOUR NUMBERS")).toBe(false);
  });

  test("no headline or sub carries a bare numeral before the payoff", () => {
    const offenders = V43_SCENES.slice(0, V43_PAYOFF_INDEX)
      .flatMap((s, i) => [
        { i, field: "headline", text: s.headline },
        { i, field: "sub", text: s.sub },
      ])
      .filter((x) => bareNumerals(x.text))
      // The 7 beat names 7 in prose deliberately — it IS the number revealed in
      // that same scene, so it cannot be mistaken for a different one.
      .filter((x) => !`${V43_SCENES[x.i].headline ?? ""}${V43_SCENES[x.i].sub ?? ""}`.includes("stays neutral"))
      .filter((x) => !(V43_SCENES[x.i].headline ?? "").startsWith("You lean to"));
    expect(offenders).toEqual([]);
  });

  test("the hook does NOT name the answer — the V42 mistake", () => {
    // "IT'S 1 AND 7" gave the whole payload away at frame 0. The opening beats
    // may pose the question and count the answers, but must not list them.
    const opening = V43_SCENES.slice(0, V43_PAYOFF_INDEX)
      .map((s) => `${s.headline ?? ""} ${s.sub ?? ""}`)
      .join(" ")
      .toUpperCase();
    expect(opening).not.toContain("2 AND 4");
  });
});

describe("sceneEntrance", () => {
  // 🔴🔴 MEASURED ON THE PUBLISHED V48 mp4, 2026-08-28. Frame 54 (1.808s) is
  // 50% non-black at mean luma 55.4. Frame 56 (1.875s) is 0.19% NON-BLACK at
  // mean 7.05 — the copy had faded to nothing over a dark ground, and the
  // whole frame is black. It settles only at 2.277s.
  //
  // That frame is the payload beat. `timing.ts` moved the payload to 2.0s
  // BECAUSE viewers were leaving before anything promised arrived, and it
  // renders empty. It sits inside the segment where 56.9% of the survivors of
  // second 1 leave.
  //
  // KineticVideo.tsx's own header forbids exactly this: "HARD CUT, NEVER A
  // CROSS-FADE… a dissolve averages two grounds together for its whole
  // duration, which is exactly the 'nothing happened' frame this format exists
  // to eliminate." Ramping the copy's opacity from 0 IS that cross-fade.
  test("a scene's copy is fully opaque on that scene's own first frame", () => {
    expect(sceneEntrance(0, false).opacity).toBe(1);
  });

  test("the poster frame is still static", () => {
    expect(sceneEntrance(0, true)).toEqual({ opacity: 1, lift: 0 });
  });

  // The slide is not the defect and is kept — it moves copy that is already
  // visible, so no frame is ever empty because of it.
  test("copy still slides up over the first frames of a scene", () => {
    expect(sceneEntrance(0, false).lift).toBeGreaterThan(0);
    expect(sceneEntrance(7, false).lift).toBe(0);
  });
});

/**
 * 🔴🔴 THE HOLE THAT SHIPPED IN V49 — the highlighted cell disappearing at the
 * cut. `checkTableShape` proved the highlight was in RANGE; nothing proved the
 * cell was VISIBLE, and `judgeEveryFrame` is structurally blind to a defect
 * that small. These are the tests that would have caught it.
 */
describe("tableLit drives emphasis, never presence", () => {
  test("is 0 at the start of a non-first scene — which is WHY it must not be an opacity", () => {
    // The ramp itself is correct and intended. The bug was the CONSUMER: using
    // this value as the cell's `opacity` deleted the cell for nine frames.
    expect(tableLit(0, false)).toBe(0);
    expect(tableLit(9, false)).toBe(1);
  });

  test("is a hard 1 on the poster frame, under both branches", () => {
    // Frame 0 has shipped blank twice. If a future cut highlights on scene 0,
    // the cell must render fully lit rather than ramping into existence.
    expect(tableLit(0, true)).toBe(1);
    expect(tableLit(5, true)).toBe(1);
  });

  test("never returns a value outside [0,1], at any frame", () => {
    for (let f = -5; f <= 120; f++) {
      const v = tableLit(f, false);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  test("the swell floor keeps a lit cell at its full grid size, so no seam opens", () => {
    // The renderer scales a lit cell by `0.94 + 0.06 * lit`. At lit = 0 that is
    // 0.94, not the old 0.86 — 6% of a 72px cell is ~4px, under the 2px border
    // either side, so the grid lines cannot separate at the cut.
    const scaleAt = (lit: number) => 0.94 + 0.06 * lit;
    expect(scaleAt(tableLit(0, false))).toBeGreaterThanOrEqual(0.94);
    expect(scaleAt(tableLit(9, false))).toBe(1);
  });
});
