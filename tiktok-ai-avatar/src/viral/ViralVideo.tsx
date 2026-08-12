import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BrandAudio } from "../components/kit";
import { AstrolBackground } from "./components/AstrolBackground";
import { CinematicTransition } from "./components/CinematicTransition";
import { CTAEnding } from "./components/CTAEnding";
import { NumberReveal } from "./components/NumberReveal";
import { PatternInterrupt } from "./components/PatternInterrupt";
import { TraitBullet } from "./components/TraitBullet";
import { ViralHook, type HookVariant } from "./components/ViralHook";
import { useShake } from "./motion";
import { LayoutProvider, useLayout } from "./layout";
import { PaletteProvider, usePalette } from "./PaletteContext";
import { BULLET_STAGGER, spreadTraits, type ActSeconds } from "./timing";
import { planViralVideo } from "./plan";

export type ViralVideoProps = {
  /** 5–8 words. The first thing on screen, at full size, on frame 0. */
  hookText: string;
  hookAccent?: string;
  hookSub?: string;
  variant: HookVariant;
  number: number;
  numberLabel: string;
  /** Exactly 4. Each 3–7 words. */
  traits: string[];
  ctaText: string;
  music: string;
  /**
   * Per-video act structure. Optional so the locked V01-V06 baseline renders
   * byte-identically, but every NEW video sets it — a single shared structure
   * made all 28 renders exactly 17.450667s, which TikTok read as repeated
   * content. See scripts/lib/variation.mjs.
   */
  structure?: ActSeconds;
  /**
   * Palette name. Optional so the locked baseline keeps the original
   * sage-gold; every new video sets it. One palette across all 14 videos was
   * itself part of the duplicate fingerprint.
   */
  palette?: string;
  /**
   * Layout name. Optional so the locked baseline stays "centered". Varying
   * duration alone still left every frame sharing one arrangement, which is
   * the half of the fingerprint a scrolling human actually notices.
   */
  layout?: string;
};

// The value act's scene budgets are computed per video by makeValueScenes in
// timing.ts. They used to be hardcoded 72/72/42 frames sized for one 8.6s act,
// which is a large part of why every render came out exactly 17.450667s.
//
// Hold MUST NOT exceed stride — any overlap double-exposes two traits on the
// seam frame, which reads as a printing error rather than a cut. The last
// trait absorbs the remainder so the section ends on content, not a blank.
const montageStride = (total: number, count: number) => Math.floor(total / count);
const montageHold = (i: number, count: number, total: number) =>
  i === count - 1 ? total - montageStride(total, count) * (count - 1) : montageStride(total, count);

/**
 * The viral composition engine.
 *
 * 🔴 The act structure USED to be fixed, so that "only the copy and the number
 * change between videos" and two variants "share every frame of motion". That
 * made hook A/B testing cheap and it cost the account: all 28 renders came out
 * at exactly 17.450667s with cuts on the same frames, and TikTok withheld them
 * as repeated content.
 *
 * Structure is now per video (`structure` prop, chosen by
 * scripts/lib/variation.mjs). Act proportions still govern retention — hook
 * first, CTA last, nothing held past SCENE_CHANGE — but the absolute lengths
 * and the cut positions differ every time.
 */
export const ViralVideo: React.FC<ViralVideoProps> = (props) => {
  const {
    hookText,
    hookAccent,
    hookSub,
    variant,
    number,
    numberLabel,
    traits,
    ctaText,
    music,
    palette,
    layout,
  } = props;
  // ⭐⭐ ONE computation, shared with the gate. This used to live here, inline,
  // next to a module-private `beatsFor` — which is exactly why
  // `runStructuralGates` could never block anything: nothing outside this
  // component could reproduce the numbers the gates were supposed to judge.
  // Root.tsx's calculateMetadata now calls `assertRenderable` on the SAME
  // function, so the gate measures the video that actually renders.
  const { acts, scenes } = planViralVideo(props);

  // Traits spread across however many pair scenes the act affords. A longer
  // act adds SCENES rather than stretching them past the 1.2s ceiling, so a
  // long video shows one trait at a time where a short one shows two.
  // 🔴🔴 SPREAD TRAITS EVENLY — 4 traits over 3 scenes is 2,1,1, NEVER 2,2,0.
  //
  // This was `ceil(traits.length / pairs.length)` traits per scene, sliced by
  // index. With the common 4-traits-over-3-scenes shape that put [0,1] and
  // [2,3] in the first two scenes and sliced PAST THE END for the third, which
  // rendered a ~1.7s hole of bare background mid-video. V03 — the account's
  // best post — ships with that hole, and it went unnoticed for weeks because
  // the frame is not blank, just empty of content.
  // 🔴 Lifted to `spreadTraits` in timing.ts so `checkTraitCoverage` can gate on
  // the SAME deal the component renders. Inline, it was unverifiable from
  // outside — and it dealt [1,1,1,1,0] on V33, shipping 2.13s of blank screen.
  const traitChunks = spreadTraits(traits, scenes.pairs.length);

  // Interrupts land on the beats where attention historically decays.
  const interruptFrames = [acts.buildStart, acts.valueStart, acts.valueStart + 180];
  const shake = useShake(acts.valueStart, 10, 7);

  return (
    <PaletteProvider name={palette}>
      <LayoutProvider name={layout}>
      <AbsoluteFill>
      {/* fadeFloor: the viral beds are picked for a hard transient ON FRAME 0
          (see the 150 BPM notes in brand.ts). The old 0-floor fade multiplied
          exactly that transient by zero. 0.85 over 2 frames keeps the hit
          audible while still ramping enough to avoid a click. */}
      <BrandAudio src={music} total={acts.total} start={0} fadeIn={2} vol={0.46} fadeFloor={0.85} />

      <AstrolBackground rotationSpeed={7} particleDensity={95} pulseAt={interruptFrames} />

      {/* ── HOOK + BUILD 0–2s — ONE continuous mount ───────────────────────
          🔴 CYCLE 1, 2026-08-09: CuriosityGap removed from the build act. Its
          contract was "open a loop, never fully resolve" — exactly what the
          data diagnosed as fatal: viewers left during the hold before the
          promised payload arrived. The hook stays up through the build beat
          instead, so the screen is never empty and nothing new has to be read
          before the payload lands.

          🔴🔴 THE HOOK IS MOUNTED ONCE, IN ONE SEQUENCE, THROUGH `buildEnd`.
          It used to be TWO ViralHooks — one Sequence for the hook act, a
          second wrapped in CinematicTransition from `buildStart`. A Remotion
          Sequence resets useCurrentFrame() to 0 for its children, so every
          frame-derived animation in ViralHook RESTARTED at the act boundary:
          the Burst spring, useSnapOpacity, the `settle` interpolate,
          useAberration, useCameraDrift. Worse, ViralHook delays its accent by
          5 frames and its subtext by 10, so for the first third of a second of
          the build act THOSE TWO LINES DID NOT EXIST. Sampled from a real
          render of Viral-01: frame 34 was the clean three-line hook; frame 37
          was the headline blown past both frame edges, greyed and tilted, with
          accent and subtext gone; it reassembled by ~frame 50. A visible
          detonation in the exact second this cycle exists to repair.

          ⭐ The zoom toward the payload is still there — it is ViralHook's own
          `useCameraDrift`, now given the full hook+build span, so it pushes in
          monotonically from 1.0 and lands at 1.08 ON the payload cut instead of
          snapping back to 1.0 mid-beat. CinematicTransition cannot do that job
          here: it would have to re-mount the hook to get its own clock, which
          is the bug. Same components, no new visual vocabulary, one change.

          The PatternInterrupt flash still marks `buildStart` — the beat is
          still punctuated, it just no longer costs the hook. */}
      <Sequence durationInFrames={acts.buildEnd}>
        <ViralHook
          text={hookText}
          accent={hookAccent}
          subtext={hookSub}
          variant={variant}
          durationInFrames={acts.buildEnd}
        />
      </Sequence>
      <Sequence from={acts.buildStart} durationInFrames={10}>
        <PatternInterrupt type="flash" />
      </Sequence>

      {/* ── VALUE 8–18s ─────────────────────────────────────────────────── */}
      <Sequence from={acts.valueStart} durationInFrames={scenes.number}>
        <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
          <NumberReveal
            number={number}
            label={numberLabel}
            durationInFrames={scenes.number}
          />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={acts.valueStart} durationInFrames={9}>
        <PatternInterrupt type="colorShift" />
      </Sequence>

      {traitChunks.map((chunk, i) => (
        <Sequence
          key={i}
          from={
            acts.valueStart +
            scenes.number +
            scenes.pairs.slice(0, i).reduce((a, b) => a + b, 0)
          }
          durationInFrames={scenes.pairs[i]}
        >
          {/* Alternating transitions, so consecutive scenes don't share a
              motion signature the way every old video did. */}
          <CinematicTransition type={i % 2 === 0 ? "slide" : "zoomOut"}>
            {/* Running offset, not i * chunk.length — chunks are no longer a
                uniform size, so multiplying would repeat and skip indices. */}
            <TraitPair
              traits={chunk}
              startIndex={traitChunks.slice(0, i).reduce((a, c) => a + c.length, 0)}
            />
          </CinematicTransition>
        </Sequence>
      ))}

      <Sequence
        from={acts.valueEnd - scenes.montage}
        durationInFrames={scenes.montage}
      >
        <Montage traits={traits} total={scenes.montage} />
      </Sequence>

      {/* ── CTA 18–21s — the only branded frames ────────────────────────── */}
      <Sequence from={acts.ctaStart} durationInFrames={acts.total - acts.ctaStart}>
        <CinematicTransition type="zoomIn">
          <CTAEnding text={ctaText} durationInFrames={acts.total - acts.ctaStart} />
        </CinematicTransition>
      </Sequence>
      </AbsoluteFill>
      </LayoutProvider>
    </PaletteProvider>
  );
};

/** Two traits, the second landing BULLET_STAGGER (1.2s) after the first. */
const TraitPair: React.FC<{ traits: string[]; startIndex: number }> = ({
  traits,
  startIndex,
}) => {
  const L = useLayout();

  return (
    <AbsoluteFill
      style={{
        justifyContent: L.justify,
        alignItems: L.align === "center" ? "center" : "flex-start",
        textAlign: L.align,
        padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
        gap: L.gap,
        ...(L.traitFlow === "grid"
          ? { display: "grid", gridTemplateColumns: "1fr 1fr", alignContent: "center" }
          : {}),
      }}
    >
      {traits.map((t, i) => (
        <TraitBullet key={t} text={t} delay={i * BULLET_STAGGER} index={startIndex + i} />
      ))}
    </AbsoluteFill>
  );
};

/** Rapid recap — 4 traits flash past in 1.4s to spike rewatches. */
const Montage: React.FC<{ traits: string[]; total: number }> = ({ traits, total }) => (
  <AbsoluteFill>
    {traits.map((t, i) => (
      <Sequence
        key={t}
        from={i * montageStride(total, traits.length)}
        durationInFrames={montageHold(i, traits.length, total)}
      >
        <CinematicTransition type="zoomIn" durationInFrames={3}>
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: 90,
              textAlign: "center",
            }}
          >
            <MontageWord text={t} />
          </AbsoluteFill>
        </CinematicTransition>
      </Sequence>
    ))}
  </AbsoluteFill>
);

const MontageWord: React.FC<{ text: string }> = ({ text }) => {
  const P = usePalette();

  return (
    <div
      style={{
        fontFamily: "inherit",
        fontSize: 88,
        fontWeight: 900,
        color: P.TEXT,
        lineHeight: 1.1,
        // Was a hardcoded warm drop shadow, which is invisible on the two dark
        // palettes. The palette owns the treatment now.
        textShadow: P.TEXT_SHADOW,
      }}
    >
      {text}
    </div>
  );
};
