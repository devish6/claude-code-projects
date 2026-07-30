import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BrandAudio } from "../components/kit";
import { AstrolBackground } from "./components/AstrolBackground";
import { CinematicTransition } from "./components/CinematicTransition";
import { CTAEnding } from "./components/CTAEnding";
import { CuriosityGap } from "./components/CuriosityGap";
import { NumberReveal } from "./components/NumberReveal";
import { PatternInterrupt } from "./components/PatternInterrupt";
import { TraitBullet } from "./components/TraitBullet";
import { ViralHook, type HookVariant } from "./components/ViralHook";
import { useShake } from "./motion";
import { TEXT } from "./palette";
import { ACT, BULLET_STAGGER, makeActs, makeValueScenes, type ActSeconds } from "./timing";

export type ViralVideoProps = {
  /** 5–8 words. The first thing on screen, at full size, on frame 0. */
  hookText: string;
  hookAccent?: string;
  hookSub?: string;
  variant: HookVariant;
  /** Opens the loop. */
  buildSetup: string;
  /** Escalates it — never fully resolves it. */
  buildReveal: string;
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
export const ViralVideo: React.FC<ViralVideoProps> = ({
  hookText,
  hookAccent,
  hookSub,
  variant,
  buildSetup,
  buildReveal,
  number,
  numberLabel,
  traits,
  ctaText,
  music,
  structure,
}) => {
  const acts = structure ? makeActs(structure) : ACT;
  const scenes = makeValueScenes(acts.valueEnd - acts.valueStart);

  // Traits spread across however many pair scenes the act affords. A longer
  // act adds SCENES rather than stretching them past the 1.2s ceiling, so a
  // long video shows one trait at a time where a short one shows two.
  const perScene = Math.ceil(traits.length / scenes.pairs.length);
  const traitChunks = scenes.pairs.map((_, i) =>
    traits.slice(i * perScene, (i + 1) * perScene),
  );

  // Interrupts land on the beats where attention historically decays.
  const interruptFrames = [acts.buildStart, acts.valueStart, acts.valueStart + 180];
  const shake = useShake(acts.valueStart, 10, 7);

  return (
    <AbsoluteFill>
      {/* fadeFloor: the viral beds are picked for a hard transient ON FRAME 0
          (see the 150 BPM notes in brand.ts). The old 0-floor fade multiplied
          exactly that transient by zero. 0.85 over 2 frames keeps the hit
          audible while still ramping enough to avoid a click. */}
      <BrandAudio src={music} total={acts.total} start={0} fadeIn={2} vol={0.46} fadeFloor={0.85} />

      <AstrolBackground rotationSpeed={7} particleDensity={95} pulseAt={interruptFrames} />

      {/* ── HOOK 0–2s ───────────────────────────────────────────────────── */}
      <Sequence durationInFrames={acts.hookEnd}>
        <ViralHook
          text={hookText}
          accent={hookAccent}
          subtext={hookSub}
          variant={variant}
          durationInFrames={acts.hookEnd}
        />
      </Sequence>

      {/* ── BUILD 2–8s ──────────────────────────────────────────────────── */}
      <Sequence from={acts.buildStart} durationInFrames={acts.buildEnd - acts.buildStart}>
        <CinematicTransition type="zoomIn">
          <CuriosityGap
            setup={buildSetup}
            reveal={buildReveal}
            durationInFrames={acts.buildEnd - acts.buildStart}
          />
        </CinematicTransition>
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
            <TraitPair traits={chunk} startIndex={i * chunk.length} />
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
  );
};

/** Two traits, the second landing BULLET_STAGGER (1.2s) after the first. */
const TraitPair: React.FC<{ traits: string[]; startIndex: number }> = ({
  traits,
  startIndex,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      padding: "0 80px",
      gap: 64,
    }}
  >
    {traits.map((t, i) => (
      <TraitBullet key={t} text={t} delay={i * BULLET_STAGGER} index={startIndex + i} />
    ))}
  </AbsoluteFill>
);

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

const MontageWord: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      fontFamily: "inherit",
      fontSize: 88,
      fontWeight: 900,
      color: TEXT,
      lineHeight: 1.1,
      textShadow: "0 2px 12px rgba(52,44,18,0.32)",
    }}
  >
    {text}
  </div>
);
