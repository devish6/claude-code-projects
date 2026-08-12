import BEAT_MAPS from "../../content/beat-maps.json";
import { MUSIC } from "../lib/brand";
import { runStructuralGates } from "./qa";
import { ACT, makeActs, makeValueScenes } from "./timing";
import type { ViralVideoProps } from "./ViralVideo";

/**
 * Tracked beat times (seconds from video zero) for a bed, or undefined.
 *
 * 🪤 The prop carries the bed's PATH ("music/starlight-v03.mp3") while the beat
 * map is keyed by its MUSIC name ("starlightV03"), so this has to invert the
 * MUSIC map rather than index it. `BrandAudio` starts the bed at frame 0 with
 * no trim, so file time and video time are the same clock.
 *
 * A map is used only when the tracker could actually follow the pulse — an
 * unusable map is worse than none, because it would snap cuts onto noise.
 */
export const beatsFor = (music: string): number[] | undefined => {
  const name = Object.keys(MUSIC).find((k) => MUSIC[k as keyof typeof MUSIC] === music);
  const map = name
    ? (BEAT_MAPS as Record<string, { usable?: boolean; beatsMs?: number[] }>)[name]
    : undefined;
  return map?.usable && map.beatsMs?.length ? map.beatsMs.map((ms) => ms / 1000) : undefined;
};

/**
 * Every frame boundary a viral video has, derived from its props alone.
 *
 * ⭐⭐⭐ THIS EXISTS SO THE GATES CAN BLOCK. `runStructuralGates` sat in qa.ts
 * with no production caller, and that was not an oversight anyone forgot to
 * fix: its inputs were computed INSIDE ViralVideo's render body, next to a
 * module-private `beatsFor`. Nothing outside the component could reproduce
 * them, so nothing outside the component could check them. **A gate that
 * cannot be handed its own inputs cannot block anything.**
 *
 * One computation, three readers: the component renders from it,
 * `calculateMetadata` gates on it, and qa.test.ts asserts every shipped
 * composition passes. If they ever diverge the gate is measuring a video that
 * does not exist — so they must not be allowed to.
 *
 * 🔴 Beat-snapping is gated on `structure`, NOT on whether a beat map exists.
 * V03 and V04 ride beds that DO have usable maps, so snapping on map presence
 * would silently change the locked V01–V06 baseline that is documented as
 * rendering byte-identically. `structure` is the existing marker for a
 * post-2026-07-30 video, and every new video sets it.
 */
/**
 * The only three props the planner and the gates actually read.
 *
 * ⭐ Widened from `ViralVideoProps` so a composition that is NOT a ViralVideo —
 * EXP01, the promoted consumer explainer, which has no moolank and therefore no
 * `number`/`numberLabel` — still goes through the SAME `assertRenderable`. A
 * gate that only guards one component leaves every other render ungated, and
 * this file exists because ungated renders shipped twice.
 */
export type PlannableVideo = Pick<ViralVideoProps, "structure" | "music" | "traits">;

export const planViralVideo = (props: PlannableVideo) => {
  const acts = props.structure ? makeActs(props.structure) : ACT;
  const scenes = makeValueScenes(acts.valueEnd - acts.valueStart, {
    beats: props.structure ? beatsFor(props.music) : undefined,
    startFrame: acts.valueStart,
    traitCount: props.structure ? props.traits.length : undefined,
  });
  return { acts, scenes };
};

/**
 * Throws unless every structural gate passes. Called by `calculateMetadata`
 * in src/Root.tsx, so it runs before the first frame of ANY viral render —
 * CLI or Studio.
 *
 * ⭐⭐⭐ THIS IS WHAT "BLOCKS THE RENDER" MEANS. qa.ts opens by claiming its
 * gates block and are "never an opinion, never a score" — but nothing called
 * `runStructuralGates`, so for its whole life the file was a scoring function
 * with better comments. Advisory gates are the same shape as the bug they
 * were written to catch: present, correct, and not consulted.
 *
 * 🪤 It throws rather than returning a report because a report has to be read.
 * The one composition that was failing (`Viral-07-Contrarian-Thirteen`, payload
 * at 6.9s) had been failing since cycle 1 moved the standard, in a repo where
 * the suite was green the entire time.
 */
export const assertRenderable = (id: string, props: PlannableVideo): void => {
  const { acts, scenes } = planViralVideo(props);
  const failed = runStructuralGates({
    acts,
    scenes: scenes.pairs,
    traits: props.traits,
  }).filter((g) => !g.pass);

  if (failed.length) {
    throw new Error(
      `${id} fails ${failed.length} structural gate(s) and will not render:\n` +
        failed.map((g) => `  · ${g.name} — ${g.detail}`).join("\n"),
    );
  }
};
