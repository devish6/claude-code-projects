/**
 * Deterministic render gates. Blocks the render; never an opinion, never a
 * score.
 *
 * ⭐⭐ Every gate here encodes a bug that already shipped. The design rejected
 * a model grading its own output for exactly the reason these are assertions:
 * a score drifts, an assertion does not.
 */
import { SCENE_CHANGE, sec, spreadTraits } from "./timing";

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

/**
 * Every value scene must actually receive a trait.
 *
 * 🔴🔴 `checkTraitParity` IS NOT THIS CHECK, AND ITS NAME SAYS OTHERWISE. It
 * reads "scene count matches trait count" and asserts `scenes.length >=
 * traitCount` — surplus scenes pass. That gap is not theoretical: V33's `essay`
 * act produced 5 scenes for 4 traits, `spreadTraits` dealt [1,1,1,1,0], and
 * frames 465–528 rendered at stddev 10.3 against the 18 floor — **2.13 seconds
 * of blank screen mid-video, through a green suite and a passing `qa:frame`.**
 *
 * ⛔ Do not "fix" that by tightening parity to `===`. Scenes exceeding traits is
 * legal and sometimes required — `makeValueScenes` ADDS scenes rather than
 * stretching a pair past `SCENE_CHANGE * 2`, which is the rule that keeps a
 * trait off screen past 1.2s. What must never happen is a scene with nothing in
 * it, and that is a question about the DEAL, not about the counts. So this gate
 * runs the real `spreadTraits` — the same function the component renders from —
 * rather than re-deriving the rule and drifting from it.
 *
 * 🪤 `qa:frame` cannot catch this: it only ever looks at frame 0.
 */
export const checkTraitCoverage = (scenes: number[], traits: string[]): Gate => {
  const empty = spreadTraits(traits, scenes.length)
    .map((chunk, i) => (chunk.length === 0 ? i : -1))
    .filter((i) => i >= 0);
  return {
    name: "every value scene receives a trait",
    pass: empty.length === 0,
    detail: empty.length
      ? `scene(s) ${empty.join(", ")} of ${scenes.length} get no trait from ${traits.length} traits`
      : `all ${scenes.length} scenes covered by ${traits.length} traits`,
  };
};

export const runStructuralGates = ({
  acts,
  scenes,
  traits,
}: {
  acts: { valueStart: number };
  scenes: number[];
  traits: string[];
}): Gate[] => [
  checkPayloadTiming(acts),
  checkSceneCeilings(scenes),
  checkTraitParity(scenes, traits.length),
  checkTraitCoverage(scenes, traits),
];
