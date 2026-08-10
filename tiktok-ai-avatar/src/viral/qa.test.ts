import { describe, expect, test } from "vitest";

import { SCENE_CHANGE, makeActs } from "./timing";
import { planViralVideo } from "./plan";
import { VIRAL_TEMPLATES } from "./templates";
import { DAILY_TEMPLATES } from "./daily-templates";
import {
  PAYLOAD_BY_FRAME,
  checkPayloadTiming,
  checkSceneCeilings,
  checkTraitParity,
  runStructuralGates,
} from "./qa";
import { assertRenderable } from "./plan";

/**
 * Every gate here encodes a bug that actually shipped. A rule that depends on
 * someone noticing is not a rule.
 */

describe("checkPayloadTiming", () => {
  // The diagnosis: the old structure put the payload at 6.4s behind a `build`
  // act specified to "open a curiosity loop, never fully resolve". We asked
  // someone who decides in under two seconds to wait nearly five on faith.
  test("fails an act structure whose payload lands after 2.0s", () => {
    const gate = checkPayloadTiming(makeActs({ hook: 1.6, build: 4.8, value: 8.6, cta: 2.4 }));

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("192");
  });

  test("passes when the payload lands on the 2.0s boundary", () => {
    const gate = checkPayloadTiming(makeActs({ hook: 1.2, build: 0.8, value: 13.0, cta: 2.4 }));

    expect(gate.pass).toBe(true);
  });

  test("the boundary is frame 60", () => {
    expect(PAYLOAD_BY_FRAME).toBe(60);
  });
});

describe("checkSceneCeilings", () => {
  // 🔴 A pair scene shows TWO traits, so exceeding SCENE_CHANGE * 2 leaves one
  // trait on screen past the 1.2s ceiling — the exact bug that once held
  // traits for 2.05s.
  test("fails a scene longer than SCENE_CHANGE * 2", () => {
    const gate = checkSceneCeilings([30, SCENE_CHANGE * 2 + 1, 30]);

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("73");
  });

  test("passes a scene exactly on the ceiling", () => {
    expect(checkSceneCeilings([SCENE_CHANGE * 2]).pass).toBe(true);
  });
});

describe("checkTraitParity", () => {
  // Shipped as a 0.47s flash: 4 traits packed into 3 scenes left the staggered
  // second bullet just 14 frames. Fixed in 00dfe8b; this is the guard.
  test("fails when there are fewer scenes than traits", () => {
    const gate = checkTraitParity([50, 50, 50], 4);

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("3 scenes");
  });

  test("passes one trait per scene", () => {
    expect(checkTraitParity([40, 40, 40, 40], 4).pass).toBe(true);
  });
});

describe("runStructuralGates", () => {
  test("returns every gate, so a render reports all its faults at once", () => {
    const gates = runStructuralGates({
      acts: makeActs({ hook: 1.6, build: 4.8, value: 8.6, cta: 2.4 }),
      scenes: [50, 50, 50],
      traitCount: 4,
    });

    expect(gates).toHaveLength(3);
    expect(gates.filter((g) => !g.pass)).toHaveLength(2);
  });
});

/**
 * ⭐⭐⭐ THE GATES WERE ADVISORY, AND THIS IS WHY.
 *
 * `runStructuralGates` had no production caller. Not an oversight — its inputs
 * (`acts`, `scenes`) were computed INSIDE ViralVideo's render body, alongside a
 * private `beatsFor`, so nothing outside the component could reproduce them.
 * A gate that cannot be handed its own inputs cannot block anything.
 *
 * `planViralVideo` is that computation lifted out, so the component, the gates
 * and this test all read the SAME numbers. Everything shipped has to pass, or
 * making the gates blocking would break a render that is already out.
 */
describe("every shipped composition passes the structural gates", () => {
  const compositions = Object.entries({ ...VIRAL_TEMPLATES, ...DAILY_TEMPLATES });

  test("there are compositions to check -- a vacuous pass is not a pass", () => {
    expect(compositions.length).toBeGreaterThan(5);
  });

  test.each(compositions)("%s", (_id, props) => {
    const { acts, scenes } = planViralVideo(props);
    const failed = runStructuralGates({
      acts,
      scenes: scenes.pairs,
      traitCount: props.traits.length,
    }).filter((g) => !g.pass);

    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });
});

/**
 * 🔴🔴 THE GATES NOW BLOCK. `assertRenderable` is what `calculateMetadata`
 * calls in src/Root.tsx, so a composition that fails a structural gate cannot
 * be rendered by the CLI or opened in the Studio — it throws before a single
 * frame is drawn.
 *
 * qa/SKILL.md used to claim the gates "block the render" when nothing called
 * them. This is that claim made true.
 */
describe("assertRenderable", () => {
  const good = VIRAL_TEMPLATES["Viral-01-Identity-Seven"];

  test("a composition that passes every gate renders", () => {
    expect(() => assertRenderable("Viral-01-Identity-Seven", good)).not.toThrow();
  });

  // The exact structure this template shipped with until cycle 1 reached it.
  test("a payload behind a 5.1s build is refused, and the error says why", () => {
    const stale = { ...good, structure: { hook: 1.747, build: 5.146, value: 8.565, cta: 2.997 } };

    expect(() => assertRenderable("Viral-07-Contrarian-Thirteen", stale)).toThrow(
      /Viral-07-Contrarian-Thirteen.*payload beat lands by 2\.0s.*207/s,
    );
  });
});
