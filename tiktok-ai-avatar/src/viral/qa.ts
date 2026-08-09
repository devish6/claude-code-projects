/**
 * Deterministic render gates. Blocks the render; never an opinion, never a
 * score.
 *
 * ⭐⭐ Every gate here encodes a bug that already shipped. The design rejected
 * a model grading its own output for exactly the reason these are assertions:
 * a score drifts, an assertion does not.
 */
import { SCENE_CHANGE, sec } from "./timing";

export type Gate = { name: string; pass: boolean; detail: string };

/**
 * The first payload beat must begin by 2.0 seconds.
 *
 * > The first payload beat is the first moment the viewer receives a concrete
 * > piece of the thing the hook promised — a number and its actual trait, not
 * > a restatement of the question, not a transition, not branding.
 *
 * The test is falsifiable: if a frame could be removed and the viewer would
 * lose no information they were promised, it is not the payload beat.
 */
export const PAYLOAD_BY_FRAME = sec(2.0);

export const checkPayloadTiming = (acts: { valueStart: number }): Gate => ({
  name: "payload beat lands by 2.0s",
  pass: acts.valueStart <= PAYLOAD_BY_FRAME,
  detail: `payload starts at frame ${acts.valueStart}, ceiling ${PAYLOAD_BY_FRAME}`,
});

export const checkSceneCeilings = (scenes: number[]): Gate => {
  const ceiling = SCENE_CHANGE * 2;
  const over = scenes.filter((s) => s > ceiling);
  return {
    name: "no scene exceeds SCENE_CHANGE * 2",
    pass: over.length === 0,
    detail: over.length ? `over ceiling ${ceiling}: ${over.join(", ")}` : `all within ${ceiling}`,
  };
};

/**
 * ⭐⭐ Prefer one trait per scene. Packing two traits into a scene sized for
 * one leaves the staggered second bullet a 0.47s flash and makes the pacing
 * lopsided — two traits rushed, then two dwelt on.
 */
export const checkTraitParity = (scenes: number[], traitCount: number): Gate => ({
  name: "scene count matches trait count",
  pass: scenes.length >= traitCount,
  detail: `${scenes.length} scenes for ${traitCount} traits`,
});

export const runStructuralGates = ({
  acts,
  scenes,
  traitCount,
}: {
  acts: { valueStart: number };
  scenes: number[];
  traitCount: number;
}): Gate[] => [
  checkPayloadTiming(acts),
  checkSceneCeilings(scenes),
  checkTraitParity(scenes, traitCount),
];
