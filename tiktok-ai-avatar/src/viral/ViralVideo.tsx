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
import { ACT, BULLET_STAGGER } from "./timing";

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
};

// Value act is split into four scenes so nothing holds longer than ~1.2s.
// All durations are the 21.75s cut scaled by 0.8 (the 1.25x speed-up).
const V_NUMBER = 72; // 2.4s  digit scramble + burst
const V_PAIR = 72; // 2.4s  two traits (one lands every 1.2s)
// 1.4s recap. The 1.0s original gave each trait ~0.23s, which was below
// reading threshold; at 4 traits over 1.4s each holds ~0.35s — near the floor
// but still legible. Do not shorten this further.
const V_MONTAGE = 42;
const MONTAGE_STRIDE = 10;
// Hold MUST NOT exceed stride — any overlap double-exposes two traits on the
// seam frame, which reads as a printing error rather than a cut. The last
// trait absorbs the remainder so the section ends on content, not a blank.
const montageHold = (i: number, count: number) =>
  i === count - 1 ? V_MONTAGE - MONTAGE_STRIDE * (count - 1) : MONTAGE_STRIDE;

/**
 * The viral composition engine.
 *
 * Act structure is fixed (see timing.ts) because it is the part that governs
 * retention; only the copy and the number change between videos. That is
 * deliberate — it makes hook A/B testing cheap, since two variants differ by a
 * single prop and share every frame of motion.
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
}) => {
  // Interrupts land on the beats where attention historically decays.
  const interruptFrames = [ACT.buildStart, ACT.valueStart, ACT.valueStart + 180];
  const shake = useShake(ACT.valueStart, 10, 7);

  return (
    <AbsoluteFill>
      {/* fadeFloor: the viral beds are picked for a hard transient ON FRAME 0
          (see the 150 BPM notes in brand.ts). The old 0-floor fade multiplied
          exactly that transient by zero. 0.85 over 2 frames keeps the hit
          audible while still ramping enough to avoid a click. */}
      <BrandAudio src={music} total={ACT.total} start={0} fadeIn={2} vol={0.46} fadeFloor={0.85} />

      <AstrolBackground rotationSpeed={7} particleDensity={95} pulseAt={interruptFrames} />

      {/* ── HOOK 0–2s ───────────────────────────────────────────────────── */}
      <Sequence durationInFrames={ACT.hookEnd}>
        <ViralHook
          text={hookText}
          accent={hookAccent}
          subtext={hookSub}
          variant={variant}
          durationInFrames={ACT.hookEnd}
        />
      </Sequence>

      {/* ── BUILD 2–8s ──────────────────────────────────────────────────── */}
      <Sequence from={ACT.buildStart} durationInFrames={ACT.buildEnd - ACT.buildStart}>
        <CinematicTransition type="zoomIn">
          <CuriosityGap
            setup={buildSetup}
            reveal={buildReveal}
            durationInFrames={ACT.buildEnd - ACT.buildStart}
          />
        </CinematicTransition>
      </Sequence>
      <Sequence from={ACT.buildStart} durationInFrames={10}>
        <PatternInterrupt type="flash" />
      </Sequence>

      {/* ── VALUE 8–18s ─────────────────────────────────────────────────── */}
      <Sequence from={ACT.valueStart} durationInFrames={V_NUMBER}>
        <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
          <NumberReveal
            number={number}
            label={numberLabel}
            durationInFrames={V_NUMBER}
          />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={ACT.valueStart} durationInFrames={9}>
        <PatternInterrupt type="colorShift" />
      </Sequence>

      <Sequence from={ACT.valueStart + V_NUMBER} durationInFrames={V_PAIR}>
        <CinematicTransition type="slide">
          <TraitPair traits={traits.slice(0, 2)} startIndex={0} />
        </CinematicTransition>
      </Sequence>

      <Sequence from={ACT.valueStart + V_NUMBER + V_PAIR} durationInFrames={V_PAIR}>
        <CinematicTransition type="zoomOut">
          <TraitPair traits={traits.slice(2, 4)} startIndex={2} />
        </CinematicTransition>
      </Sequence>

      <Sequence
        from={ACT.valueStart + V_NUMBER + V_PAIR * 2}
        durationInFrames={V_MONTAGE}
      >
        <Montage traits={traits} />
      </Sequence>

      {/* ── CTA 18–21s — the only branded frames ────────────────────────── */}
      <Sequence from={ACT.ctaStart} durationInFrames={ACT.total - ACT.ctaStart}>
        <CinematicTransition type="zoomIn">
          <CTAEnding text={ctaText} durationInFrames={ACT.total - ACT.ctaStart} />
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
const Montage: React.FC<{ traits: string[] }> = ({ traits }) => (
  <AbsoluteFill>
    {traits.map((t, i) => (
      <Sequence
        key={t}
        from={i * MONTAGE_STRIDE}
        durationInFrames={montageHold(i, traits.length)}
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
