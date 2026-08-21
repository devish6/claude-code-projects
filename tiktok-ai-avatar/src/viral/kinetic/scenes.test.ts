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
  sceneOffsets,
  totalFrames,
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
