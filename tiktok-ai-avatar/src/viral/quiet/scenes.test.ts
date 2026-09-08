import { describe, expect, it } from "vitest";
import {
  DISSOLVE,
  type QuietScene,
  SCRIM_CSS,
  SCRIM_STOPS,
  checkAccentContrast,
  checkInkPolarityHandoff,
  checkTextContrast,
  checkUnderLineEntrance,
  checkUnderLineEntranceAt,
  copyOpacity,
  handoffFlags,
  isDarkInk,
  polarityCrossings,
  scrimCss,
  textShadowFor,
  underEntranceOpacity,
  underOpacity,
  underShadowFor,
} from "./scenes";
import { V50_SCENES } from "./v50-two-am";
import { V55_SCENES } from "./v55-already-know";
import { V56_SCENES } from "./v56-everyone-comes-to-you";
import { V57_SCENES } from "./v57-seen-this-ending";

/**
 * ⭐⭐⭐ THE SCRIM IS MEASURED IN ONE PLACE AND RENDERED IN ANOTHER, SO THE TWO
 * MUST BE THE SAME OBJECT.
 *
 * `checkTextContrast` decides whether type is legible by modelling the scrim
 * as alpha stops. `QuietVideo` darkens the frame with a CSS gradient. If those
 * two ever describe different gradients the gate still passes — against a scrim
 * that is not the one on screen. That is the failure class this repo keeps
 * paying for, so the CSS is BUILT from the stops the gate measures, and this
 * test pins the built string to the exact literal that shipped V50–V58.
 */
describe("the scrim the gate measures is the scrim the renderer draws", () => {
  it("builds the exact CSS that shipped, from the stops the gate reads", () => {
    expect(SCRIM_CSS.light).toBe(
      "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 38%, rgba(0,0,0,0.16) 62%, rgba(0,0,0,0.46) 100%)",
    );
    expect(SCRIM_CSS.normal).toBe(
      "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.26) 36%, rgba(0,0,0,0.34) 62%, rgba(0,0,0,0.72) 100%)",
    );
    expect(SCRIM_CSS.heavy).toBe(
      "linear-gradient(180deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.56) 40%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.78) 100%)",
    );
  });

  it("would notice a stop drifting away from the shipped gradient", () => {
    const drifted = SCRIM_STOPS.light.map((s, i) => (i === 0 ? { ...s, alpha: 0.31 } : s));
    expect(scrimCss(drifted)).not.toBe(SCRIM_CSS.light);
  });
});

/**
 * ⭐⭐⭐⭐ THE GATE THAT WOULD HAVE CAUGHT V58's FLATTENED LADDER BEFORE IT
 * RENDERED — and did catch a second failure nobody was looking for.
 *
 * V58 shipped with a per-scene scrim: `heavy` on the bright plates, `light` on
 * the dark ones. That is a legibility fix applied one scene at a time, and
 * applied to a luma ladder it is a LADDER-FLATTENING OPERATION BY CONSTRUCTION
 * — it darkens exactly the plates whose brightness was the point. The rendered
 * cut kept 39% of the bright plates and 90% of the dark ones, and scene 3 came
 * out BRIGHTER than scene 2. The arc inverted in the middle.
 *
 * The fix is to make legibility a function of INK POLARITY instead, so the
 * scrim can be constant and can no longer flatten anything. That is only safe
 * if something actually measures the type against the photograph underneath it,
 * which nothing here did: `checkAccentContrast` compares the accent to the INK
 * and never to the GROUND. Under a uniform scrim V58 scene 3's gold accent
 * measures 2.28:1 against its own plate — invisible, and every gate green.
 */
describe("type is measured against the photograph it sits on", () => {
  const scene = (over: Partial<QuietScene> = {}): QuietScene => ({
    seconds: 2.8,
    bg: "glass-a",
    scrim: "light",
    fg: "#1C1712",
    accent: "#67270C",
    accentWord: "beat",
    line: "one held beat",
    ...over,
  });

  it("passes cream ink on the dark grounds every shipped cut used", () => {
    const g = checkTextContrast([scene({ bg: "night-a", fg: "#EEF2FA", accent: "#9FB6DA" })]);
    expect(g.detail ?? "").toBe("");
    expect(g.ok).toBe(true);
  });

  it("passes dark ink on a light ground under a light scrim", () => {
    expect(checkTextContrast([scene()]).ok).toBe(true);
  });

  it("fails cream ink on a light ground — the pairing the scrim was hiding", () => {
    // 🪤 This is why V58's opener needed the `heavy` scrim, and why the heavy
    //    scrim is what threw the plate away. Cream on `glass-a` + `light`
    //    measures 2.20:1 at the middle of the block.
    expect(checkTextContrast([scene({ fg: "#FFF6EA", accent: "#F4CE8E" })]).ok).toBe(false);
  });

  it("fails dark ink on a dark ground", () => {
    expect(checkTextContrast([scene({ bg: "fold-e" })]).ok).toBe(false);
  });

  it("fails an accent that vanishes into its own ground while the ink is fine", () => {
    // ⭐ THE ONE NO EXISTING GATE COULD SEE. The ink reads at 3.7:1; the gold
    //   accent reads at 2.3:1 on the same rows. `checkAccentContrast` passes it
    //   because gold is nothing like cream — it never looks at the photograph.
    const mid = [scene({ bg: "plaster-c", fg: "#F7F2EA", accent: "#E4B978" })];
    expect(checkAccentContrast(mid).ok).toBe(true);
    expect(checkTextContrast(mid).ok).toBe(false);
    expect(checkTextContrast(mid).detail).toMatch(/accent/);
  });

  it("fails a ground it has never measured, rather than skipping it", () => {
    // 🔴 A gate that silently passes what it cannot see is the failure class
    //    this repo has now paid for four times. An unmeasured plate is a FAIL.
    const g = checkTextContrast([scene({ bg: "not-a-real-ground" })]);
    expect(g.ok).toBe(false);
    expect(g.detail).toMatch(/not-a-real-ground/);
  });
});

/**
 * ⭐⭐⭐⭐ WHEN THE INK FLIPS POLARITY, THE TYPE MUST HAND OFF THROUGH NOTHING.
 *
 * Every dissolve in this format already puts two copies on screen at once — the
 * outgoing scene's and the incoming scene's, both at full opacity, for 15
 * frames. With one ink that is a legible cross-fade. With OPPOSITE inks it is
 * dark lettering stacked on cream lettering, which is the "0.5s dissolve looks
 * like a glitch" Codex flagged before the first render of V58 was cut.
 *
 * ⇒ At a polarity crossing the outgoing copy fades out COMPLETELY, the frame
 * carries no type for a beat, and the incoming copy fades in. Never a cross.
 *
 * 🔴🔴 AND THE GAP IS ONLY SAFE WHERE THE GROUND CARRIES THE LIGHT. The whole
 * format exists because kinetic shipped a black frame at its payload beat: the
 * copy ramped from zero on a dark ground where THE COPY IS THE ONLY LIT THING.
 * Removing the type for a beat over `fold-e` would rebuild that hole by hand.
 * Over `plaster-c` and `stone-d` the photograph is still plainly a photograph,
 * so the gate demands the grounds on both sides be genuinely lit.
 */
describe("an ink polarity change hands off through a text-free beat", () => {
  const s = (bg: string, fg: string, scrim: QuietScene["scrim"] = "light"): QuietScene => ({
    seconds: 2.8, bg, scrim, fg, line: "a held line",
  });

  it("reads polarity off the ink, not off a flag somebody has to remember", () => {
    expect(isDarkInk(s("glass-a", "#1C1712"))).toBe(true);
    expect(isDarkInk(s("fold-e", "#F2ECE2"))).toBe(false);
  });

  it("finds the one crossing in a cut that changes ink once", () => {
    expect(
      polarityCrossings([
        s("glass-a", "#241C14"),
        s("linen-b", "#1C1712"),
        s("plaster-c", "#1C1712"),
        s("stone-d", "#F5F0E8"),
        s("fold-e", "#F2ECE2"),
      ]),
    ).toEqual([2]);
  });

  it("passes a single crossing made over two well-lit grounds", () => {
    const g = checkInkPolarityHandoff([
      s("glass-a", "#241C14"),
      s("plaster-c", "#1C1712"),
      s("stone-d", "#F5F0E8"),
    ]);
    expect(g.detail ?? "").toBe("");
    expect(g.ok).toBe(true);
  });

  it("refuses a crossing made over a dark ground, where the copy is the light", () => {
    const g = checkInkPolarityHandoff([s("fold-e", "#1C1712"), s("threshold-f", "#FFF0E4")]);
    expect(g.ok).toBe(false);
    expect(g.detail).toMatch(/fold-e|threshold-f/);
  });

  it("refuses a cut that flips ink twice", () => {
    const g = checkInkPolarityHandoff([
      s("glass-a", "#241C14"),
      s("linen-b", "#1C1712"),
      s("plaster-c", "#F7F2EA"),
      s("stone-d", "#1C1712"),
    ]);
    expect(g.ok).toBe(false);
    expect(g.detail).toMatch(/flips 2 times/);
  });

  it("passes a cut that never changes ink at all, as V50–V57 do", () => {
    expect(checkInkPolarityHandoff([s("night-a", "#EEF2FA"), s("fold-e", "#F2ECE2")]).ok).toBe(true);
  });
});

/**
 * ⭐⭐⭐ THE HANDOFF ITSELF. `groundOpacity` guarantees the two GROUNDS always
 * sum to ~1 through a dissolve; `copyOpacity` is the same question for the TYPE,
 * and it has the opposite answer at exactly one place in a cut.
 *
 * ⛔ IT MUST BE A NO-OP UNLESS ASKED. V50–V57 hold their copy at full opacity
 * through every dissolve and must keep rendering byte-for-byte as published, so
 * with both flags false this returns a hard 1 at every frame — including frame
 * 0, the poster frame this repo has shipped blank twice.
 */
describe("copy opacity across a polarity handoff", () => {
  const FRAMES = 100;

  it("is a hard 1 at every frame when neither side flips", () => {
    for (const f of [0, 1, 50, 84, 90, 99]) {
      expect(copyOpacity(f, FRAMES, false, false)).toBe(1);
    }
  });

  it("holds the outgoing copy, then takes it to nothing inside the dissolve", () => {
    expect(copyOpacity(84, FRAMES, true, false)).toBe(1);
    expect(copyOpacity(85, FRAMES, true, false)).toBe(1);
    expect(copyOpacity(88, FRAMES, true, false)).toBeCloseTo(0.5, 5);
    expect(copyOpacity(91, FRAMES, true, false)).toBe(0);
    expect(copyOpacity(99, FRAMES, true, false)).toBe(0);
  });

  it("keeps the incoming copy off screen until the outgoing one has gone", () => {
    expect(copyOpacity(0, FRAMES, false, true)).toBe(0);
    expect(copyOpacity(9, FRAMES, false, true)).toBe(0);
    expect(copyOpacity(12, FRAMES, false, true)).toBeCloseTo(0.5, 5);
    expect(copyOpacity(15, FRAMES, false, true)).toBe(1);
    expect(copyOpacity(60, FRAMES, false, true)).toBe(1);
  });

  it("leaves a real beat with no type on screen, not an instantaneous swap", () => {
    // The outgoing scene ends where the incoming one's dissolve began, so both
    // are measured against that shared frame. 🪤 A swap that merely meets at a
    // point is not what was asked for — the frame has to be empty of type.
    const out = (k: number) => copyOpacity(FRAMES - DISSOLVE + k, FRAMES, true, false);
    const inn = (k: number) => copyOpacity(k, FRAMES, false, true);
    const empty = [...Array(DISSOLVE).keys()].filter((k) => out(k) === 0 && inn(k) === 0);
    expect(empty.length).toBeGreaterThanOrEqual(3);
    expect(empty[0]).toBe(6);
  });
});

/**
 * ⭐⭐⭐ THE UNDER-LINE ARRIVES BY GETTING BRIGHTER, WHICH IS A DIFFERENT EVENT
 * DEPENDING ON WHICH WAY THE INK POINTS.
 *
 * A cream under-line at 0.34 opacity over a dark ground is a dim cream line —
 * still the brightest thing there. A DARK under-line at 0.34 over a light ground
 * is 34% of the way from the photograph towards black, i.e. very nearly the
 * photograph: measured at 1.56–1.73:1, which is not faint, it is absent.
 *
 * 🪤 THE FLOOR HERE IS 2.2, NOT THE 3.0 READING FLOOR, AND THAT IS DELIBERATE.
 * Every cut this account has shipped enters its under-line below 3.0 — stone-d
 * at 2.26, fold-e and threshold-f at 2.73 — for the 0.55s before the ramp
 * finishes. A 3.0 gate here would fail V50–V57, which must keep rendering
 * byte-for-byte as published. So the gate is calibrated on what ships: it
 * catches an under-line that is INVISIBLE, not one that is merely quiet.
 */
describe("the under-line's arrival is legible whichever way the ink points", () => {
  const s = (bg: string, fg: string): QuietScene => ({
    seconds: 2.8, bg, scrim: "light", fg, line: "a held line", under: "and the quiet half",
  });

  it("leaves the cream floor exactly where every shipped cut put it", () => {
    expect(underEntranceOpacity(s("fold-e", "#F2ECE2"))).toBe(0.34);
    expect(underOpacity(0, s("fold-e", "#F2ECE2"))).toBe(0.34);
    expect(underOpacity(1, s("fold-e", "#F2ECE2"))).toBeCloseTo(0.92, 5);
  });

  it("raises the floor for dark ink, which has nowhere to be dim", () => {
    expect(underEntranceOpacity(s("glass-a", "#241C14"))).toBeGreaterThan(0.34);
    expect(underOpacity(1, s("glass-a", "#241C14"))).toBeCloseTo(0.92, 5);
  });

  it("passes every cut that has actually shipped", () => {
    for (const cut of [V50_SCENES, V55_SCENES, V56_SCENES, V57_SCENES]) {
      expect(checkUnderLineEntrance(cut).detail ?? "").toBe("");
    }
  });

  it("passes the dark-ink scenes at their raised floor", () => {
    const g = checkUnderLineEntrance([s("glass-a", "#241C14"), s("plaster-c", "#1C1712")]);
    expect(g.detail ?? "").toBe("");
  });

  it("would notice a dark under-line handed the cream floor", () => {
    // The whole point: same scene, same ground, floor forced back to 0.34.
    const g = checkUnderLineEntranceAt([s("glass-a", "#241C14")], 0.34);
    expect(g.ok).toBe(false);
    expect(g.detail).toMatch(/glass-a/);
  });

  it("ignores a scene with no under-line at all", () => {
    const bare: QuietScene = { seconds: 2.8, bg: "glass-a", scrim: "light", fg: "#241C14", line: "x" };
    expect(checkUnderLineEntrance([bare]).ok).toBe(true);
  });
});

/**
 * ⭐⭐ WHICH SCENES ACTUALLY RUN THE HANDOFF — kept out of the component so it
 * can be asserted without rendering a frame. Only the two scenes either side of
 * the crossing move; every other scene holds its copy at full opacity, which is
 * what keeps V50–V57 byte-identical.
 */
describe("the handoff is wired to the crossing and nowhere else", () => {
  const s = (bg: string, fg: string): QuietScene => ({
    seconds: 2.8, bg, scrim: "light", fg, line: "a held line",
  });

  it("moves only the pair either side of the crossing", () => {
    expect(
      handoffFlags([
        s("glass-a", "#241C14"),
        s("plaster-c", "#1C1712"),
        s("stone-d", "#F5F0E8"),
        s("fold-e", "#F2ECE2"),
      ]),
    ).toEqual([
      { fadeOut: false, fadeIn: false },
      { fadeOut: true, fadeIn: false },
      { fadeOut: false, fadeIn: true },
      { fadeOut: false, fadeIn: false },
    ]);
  });

  it("moves nothing at all in a cut with one ink, as every shipped cut has", () => {
    for (const cut of [V50_SCENES, V55_SCENES, V56_SCENES, V57_SCENES]) {
      expect(handoffFlags(cut).every((h) => !h.fadeOut && !h.fadeIn)).toBe(true);
    }
  });

  it("hangs a dark halo behind cream type and a pale one behind dark type", () => {
    expect(textShadowFor(s("fold-e", "#F2ECE2"))).toMatch(/rgba\(0,\s*0,\s*0/);
    expect(textShadowFor(s("glass-a", "#241C14"))).toMatch(/rgba\(255/);
  });

  it("leaves the shadow every shipped cut rendered exactly as it was", () => {
    for (const cut of [V50_SCENES, V55_SCENES, V56_SCENES, V57_SCENES]) {
      for (const scene of cut) {
        expect(textShadowFor(scene)).toBe("0 14px 48px rgba(0,0,0,0.68)");
        expect(underShadowFor(scene)).toBe("0 8px 30px rgba(0,0,0,0.7)");
      }
    }
  });
});
