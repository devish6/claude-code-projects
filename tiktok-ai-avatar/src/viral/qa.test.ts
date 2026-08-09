import { describe, expect, test } from "vitest";

import { SCENE_CHANGE, makeActs } from "./timing";
import {
  PAYLOAD_BY_FRAME,
  checkPayloadTiming,
  checkSceneCeilings,
  checkTraitParity,
  runStructuralGates,
} from "./qa";

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
