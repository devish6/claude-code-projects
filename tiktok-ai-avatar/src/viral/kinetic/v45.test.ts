import { describe, expect, it } from "vitest";
import { V43_SCENES } from "./v43-moolank-1";
import { V44_SCENES } from "./v44-name-number-1";
import { V45_SCENES, V45_PAYOFF_INDEX } from "./v45-september-year-turn";
import { runKineticGates, totalFrames } from "./scenes";

/**
 * 🔴 THE ONE THING V44 GOT WRONG, AS A GATE.
 *
 * V44 changed category, CTA and 11 of 13 scenes — and left scene 0's headline
 * word-for-word identical to V43. Measured 2026-08-23: the 1s hold went 61.2%
 * -> ~42% and views 219 -> 134, below the ~200 seeding floor. Nothing in the
 * repo could have told anyone that before it shipped, because no check ever
 * compared one cut's opening to the last one's.
 *
 * ⭐ So these assert the NEGATIVE — that the opening is NOT the previous cut's.
 * A test that only re-checked V45's own gates would have passed on V44 too.
 */
describe("V45 — frame 0 is new", () => {
  const prior = [
    { name: "V43", scenes: V43_SCENES },
    { name: "V44", scenes: V44_SCENES },
  ];

  it.each(prior)("does not reuse $name's hook headline", ({ scenes }) => {
    expect(V45_SCENES[0].headline).not.toBe(scenes[0].headline);
  });

  it.each(prior)("does not reuse $name's hook kicker", ({ scenes }) => {
    expect(V45_SCENES[0].kicker).not.toBe(scenes[0].kicker);
  });

  /** 🪤 The positive control. If this ever fails, the two cuts above stopped
   *  being the near-identical pair this file exists to prevent repeating, and
   *  the assertions above have quietly become vacuous. */
  it("V43 and V44 really did share a hook headline — the defect being guarded", () => {
    expect(V44_SCENES[0].headline).toBe(V43_SCENES[0].headline);
  });

  it("opens on a moving ground, which no prior cut does", () => {
    expect(V45_SCENES[0].push).toBeDefined();
    expect(V43_SCENES[0].push).toBeUndefined();
    expect(V44_SCENES[0].push).toBeUndefined();
  });

  /** A pull-IN moves fastest at the start, which is the whole point — a push
   *  OUT would put the motion after the first second, where it buys nothing. */
  it("the opening ground pulls in rather than pushing out", () => {
    const push = V45_SCENES[0].push;
    expect(push && push.from).toBeGreaterThan(push ? push.to : 0);
  });
});

describe("V45 — the package is held", () => {
  it("keeps V44's scene count and per-scene seconds exactly", () => {
    expect(V45_SCENES.map((s) => s.seconds)).toEqual(V44_SCENES.map((s) => s.seconds));
  });

  it("keeps V44's ground order exactly", () => {
    expect(V45_SCENES.map((s) => s.bg)).toEqual(V44_SCENES.map((s) => s.bg));
  });

  it("is the same length as the controls", () => {
    expect(totalFrames(V45_SCENES)).toBe(totalFrames(V44_SCENES));
  });

  it("passes every kinetic gate", () => {
    const failed = runKineticGates(V45_SCENES, V45_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}${g.detail ? ` — ${g.detail}` : ""}`)).toEqual([]);
  });
});

describe("V45 — what is on screen follows from the engine", () => {
  /** The payoff list is arithmetic on `personalYearFor`'s rule, not a
   *  numerological claim. September is EXCLUDED on purpose: it is mid-turn, so
   *  listing it would be false for whichever half of the month has passed. */
  it("names only the months whose birthday cannot have happened yet", () => {
    expect(V45_SCENES[10].headline).toBe("OCT · NOV · DEC");
  });

  it("counts them in words, never as a numeral", () => {
    expect(V45_SCENES[2].headline).toBe("THREE BIRTH MONTHS");
    expect(V45_SCENES[2].headline).not.toMatch(/\d/);
  });

  /** ⚠️ WOUND, NOT ACCUSATION. The video may name the ache; it may not tell the
   *  viewer they got it wrong, and it may not predict an outcome. */
  it("never puts the error on the viewer", () => {
    const copy = V45_SCENES.map((s) => `${s.headline ?? ""} ${s.sub ?? ""}`).join(" ");
    expect(copy).toContain("not your mistake");
    expect(copy).not.toMatch(/your fault|you failed|you were wrong/i);
  });

  it("asks for the profile, never a bare URL a muted viewer cannot click", () => {
    const cta = V45_SCENES[V45_SCENES.length - 1];
    expect(cta.sub).toContain("@numevix");
    expect(`${cta.headline} ${cta.sub}`).not.toMatch(/numevix\.com/);
  });
});
