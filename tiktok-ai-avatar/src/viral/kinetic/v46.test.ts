import { describe, expect, it } from "vitest";
import { V43_SCENES } from "./v43-moolank-1";
import { V44_SCENES } from "./v44-name-number-1";
import { V45_SCENES } from "./v45-september-year-turn";
import { V46_SCENES, V46_PAYOFF_INDEX } from "./v46-alphabet-no-nine";
import { runKineticGates, totalFrames, sceneOffsets, FPS } from "./scenes";

const PRIOR = [
  { name: "V43", scenes: V43_SCENES },
  { name: "V44", scenes: V44_SCENES },
  { name: "V45", scenes: V45_SCENES },
];

/**
 * The negative assertions. A test that only re-ran V46's own gates would have
 * passed on V44 too — V44's defect was that it reused V43's opening, and every
 * gate in the repo was green while it shipped.
 */
describe("V46 — frame 0 is new", () => {
  it.each(PRIOR)("does not reuse $name's hook headline", ({ scenes }) => {
    expect(V46_SCENES[0].headline).not.toBe(scenes[0].headline);
  });

  it.each(PRIOR)("does not reuse $name's hook kicker", ({ scenes }) => {
    expect(V46_SCENES[0].kicker).not.toBe(scenes[0].kicker);
  });

  /**
   * ⭐⭐⭐ THE ONE V45 DID NOT HAVE. V43, V44 and V45 all opened on `gold-a`,
   * and V43/V44's frame 0 measured 99.5% identical pixels. Changing the STRING
   * while holding the GROUND leaves the frame recognisable at thumbnail scale
   * and in the first ~300ms, which is the window the 1s hold measures.
   */
  it.each(PRIOR)("does not open on $name's ground", ({ scenes }) => {
    expect(V46_SCENES[0].bg).not.toBe(scenes[0].bg);
  });

  /** 🪤 Positive control. If the three prior cuts stop sharing an opening
   *  ground, the assertion above has quietly become vacuous. */
  it("V43, V44 and V45 really did all open on one ground — the defect being guarded", () => {
    expect(V44_SCENES[0].bg).toBe(V43_SCENES[0].bg);
    expect(V45_SCENES[0].bg).toBe(V43_SCENES[0].bg);
  });

  /** V45 bundled `push` with a new hook and so never measured it. Carrying it
   *  forward silently would make an untested change permanent. */
  it("does not inherit V45's untested opening push", () => {
    expect(V46_SCENES[0].push).toBeUndefined();
    expect(V45_SCENES[0].push).toBeDefined();
  });
});

/**
 * 🔴🔴 THE CLAIM'S LIMIT, AS A GATE.
 *
 * "No LETTER is worth 9" is true. "No NAME is a 9" is false — a name reduces by
 * summing its letters, and VEER sums to 18 -> 9. Asserting the negative here
 * because the false version is the shorter, punchier line, and it is exactly
 * the sentence a later edit would reach for.
 */
describe("V46 — the claim may never overreach from letters to names", () => {
  const CHALDEAN: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
    N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
  };
  const reduce = (n: number): number => {
    let v = n;
    while (v > 9 && v !== 11 && v !== 22 && v !== 33) {
      v = String(v).split("").reduce((a, d) => a + Number(d), 0);
    }
    return v;
  };
  const nameNumber = (s: string) => reduce([...s].reduce((a, c) => a + CHALDEAN[c], 0));

  it("the engine's map really does contain no 9 — the fact the hook rests on", () => {
    expect(Object.keys(CHALDEAN)).toHaveLength(26);
    expect(Object.values(CHALDEAN)).not.toContain(9);
    expect([...new Set(Object.values(CHALDEAN))].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  /** 🪤 The counterexample that makes the stronger claim false. */
  it("a NAME can still be a 9, so no scene may say otherwise", () => {
    expect(nameNumber("VEER")).toBe(9);
  });

  it("no scene claims a name cannot be a 9", () => {
    const text = V46_SCENES.map((s) => `${s.headline ?? ""} ${s.sub ?? ""}`).join(" ").toUpperCase();
    expect(text).not.toContain("NO NAME");
    expect(text).not.toContain("NO ONE IS A 9");
    expect(text).not.toContain("NOBODY IS A 9");
  });

  it("the payoff states the limit rather than burying it", () => {
    expect(V46_SCENES[V46_PAYOFF_INDEX].headline).toMatch(/SUM/i);
  });

  /** ⛔ V43 put "4 NUMBERS" on screen in a video whose answer was 1, 2, 4 and 7.
   *  A bare count numeral beside the subject numeral collides. */
  it("spells the count rather than setting it as a numeral beside the 9", () => {
    const counts = V46_SCENES.map((s) => s.headline ?? "").find((h) => /STOP AT/i.test(h));
    expect(counts).toBeDefined();
    expect(counts).toMatch(/EIGHT/);
    expect(counts).not.toMatch(/\b8\b/);
  });
});

describe("V46 — structure", () => {
  it("passes every kinetic gate", () => {
    const failed = runKineticGates(V46_SCENES, V46_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}${g.detail ? ` — ${g.detail}` : ""}`)).toEqual([]);
  });

  /**
   * ⭐ The deliberate reversal. V45 ran 22.656s and put its payoff at 17.6s,
   * where measured retention is 4%. Shorter is the point — assert it, so a
   * later edit cannot drift back toward a payoff nobody reaches.
   */
  it("is materially shorter than the 22.656s package it replaces", () => {
    expect(totalFrames(V46_SCENES)).toBeLessThan(totalFrames(V45_SCENES) * 0.65);
  });

  it("still closes the loop after the 6.4s gate, but inside the video's back half", () => {
    const startS = sceneOffsets(V46_SCENES)[V46_PAYOFF_INDEX] / FPS;
    const totalS = totalFrames(V46_SCENES) / FPS;
    expect(startS).toBeGreaterThanOrEqual(6.4);
    expect(startS / totalS).toBeLessThan(0.78);
  });

  /** The birthdate gate is what this cut exists to remove: 34 of the last 38
   *  posts opened on a date filter that disqualifies ~8 of 9 viewers on sight. */
  it("the hook contains no birthdate filter", () => {
    const hook = `${V46_SCENES[0].headline ?? ""} ${V46_SCENES[0].kicker ?? ""}`;
    expect(hook).not.toMatch(/BORN/i);
    expect(hook).not.toMatch(/\d+(ST|ND|RD|TH)\b/i);
    expect(hook).not.toMatch(/MOOLANK/i);
  });
});

/**
 * ⭐⭐⭐ THE OWNER'S NOTE ON v1 OF THIS CUT, AS A GATE.
 *
 * v1 opened on "THE ALPHABET HAS NO 9". Owner: *"not catchy at all. I would
 * skip it because I don't know what this means, like there is no context."*
 * It was a fact about a system, with no person in it — a payoff in a hook's
 * clothes. Every one of the account's best-holding openings is second person
 * and plain: .559 "People call 9s aggressive", .671 "Is 2 a weak number?",
 * .690 "If you're an 8, you've probably given more than you got".
 */
describe("V46 — the hook speaks to a person, in plain words", () => {
  const hook = V46_SCENES[0].headline ?? "";

  it("addresses the viewer directly", () => {
    expect(hook).toMatch(/\bYOU(R)?\b/i);
  });

  /** 🪤 The jargon that made v1's chip unreadable to a scroller. The chip is
   *  the one place a stranger is told what world they are in. */
  it("carries no jargon in the hook or the chip", () => {
    const opening = `${hook} ${V46_SCENES[0].kicker ?? ""}`;
    for (const word of ["CHALDEAN", "PYTHAGOREAN", "ANTARDASHA", "MAHADASHA", "PRATAYANDAR"]) {
      expect(opening.toUpperCase()).not.toContain(word);
    }
  });

  /** 🪤 The regression this exists to prevent: the 9 gap is the PAYOFF, and
   *  putting it back in frame 0 is exactly what v1 did. */
  it("does not spend the payoff in the hook", () => {
    expect(hook.toUpperCase()).not.toContain("ALPHABET HAS NO");
    expect(V46_SCENES[V46_PAYOFF_INDEX].headline?.toUpperCase()).toContain("9");
  });

  /**
   * ⭐⭐ `first-second` names the prime suspect for this account's 0–1s death:
   * "the cold-open card glimpse — dark, low-contrast, near-static ... reads as
   * NOT A VIDEO". v1 opened on `ember-a` (mean luma 20.5, contrast 13.6) —
   * darker and flatter than the `gold-a` it was escaping. Assert the opener is
   * the light ground, since every ground name here is dark except one.
   */
  it("opens on the one light, high-contrast ground we own", () => {
    expect(V46_SCENES[0].bg).toBe("dawn-a");
  });

  /**
   * 🔴🔴 THE PALE-GROUND RULE, MEASURED OFF A REAL RENDER RATHER THAN REASONED.
   *
   * "Pale ground therefore dark type" is the intuitive rule and it is WRONG in
   * this format, because every scrim darkens DOWNWARD (light runs 0.05 -> 0.45
   * alpha). Ink type then fights the scrim and contrast decays down the block:
   * measured 2.7 / 2.4 / 1.9 / **1.4**:1 against a 3.0:1 large-text floor.
   * The safe pairing on a pale ground is CREAM type on a HEAVY scrim.
   */
  it("pairs the pale opening ground with a heavy scrim and light type", () => {
    const s = V46_SCENES[0];
    const hex = (s.fg ?? "").replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    expect(luma).toBeGreaterThan(200);
    expect(s.scrim).toBe("heavy");
  });
});
