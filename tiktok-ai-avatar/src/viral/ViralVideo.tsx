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
import { ACT } from "./timing";

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

// Value act is split into four scenes so nothing holds longer than ~1.5s.
const V_NUMBER = 90; // 3.0s  digit scramble + burst
const V_PAIR = 90; // 3.0s  two traits (one lands every 1.5s)
const V_MONTAGE = 30; // 1.0s  all four flash past

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
      <BrandAudio src={music} total={ACT.total} start={0} fadeIn={4} vol={0.46} />

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

/** Two traits, the second landing 1.5s after the first. */
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
      <TraitBullet key={t} text={t} delay={i * 45} index={startIndex + i} />
    ))}
  </AbsoluteFill>
);

/** Rapid recap — 4 traits flash past in 1 second to spike rewatches. */
const Montage: React.FC<{ traits: string[] }> = ({ traits }) => (
  <AbsoluteFill>
    {traits.map((t, i) => (
      <Sequence key={t} from={i * 7} durationInFrames={8}>
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
      color: "oklch(0.95 0.012 85)",
      lineHeight: 1.1,
      textShadow: "0 2px 0 rgba(0,0,0,0.55), 0 0 26px rgba(212,175,55,0.5)",
    }}
  >
    {text}
  </div>
);
