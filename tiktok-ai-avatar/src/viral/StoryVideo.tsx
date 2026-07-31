import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { PaletteProvider, usePalette } from "./PaletteContext";
import { AstrolBackground } from "./components/AstrolBackground";
import { BrandAudio } from "../components/kit";
import { StoryFigure, type Posture } from "./components/StoryFigure";
import { DISPLAY, UI } from "./fonts";

/**
 * Story Friday — the narrative format.
 *
 * 🔴 THE CORRECTNESS RULE THIS FORMAT LIVES UNDER: it portrays the SHAPE of a
 * number combination, never a forecast of what happens to the viewer. The
 * engine produces traits, not outcomes, and /tarot's own FAQ calls this "a
 * correspondence, not a prediction". So a beat may say "this drive has nowhere
 * to land" — a description — and may never say "you will become wealthy",
 * which is an outcome claim, and a financial one at that.
 *
 * The five beats are a deliberate retention shape rather than a story arc for
 * its own sake:
 *   SETUP        — name the combination, so the right viewer self-selects
 *   COMPLICATION — the cost of it, which is what holds attention
 *   TURN         — the rule that changes the reading (the actual payload)
 *   RESOLUTION   — what the combination becomes once the turn is applied
 *   CTA          — one ask
 */

export type StoryBeat = {
  /** One line. Kept short: this is read on a phone, in motion. */
  text: string;
  posture: Posture;
  /** Fraction of the frame the figure has crossed, 0..1. */
  progress: number;
  /** A faded second figure — "everyone else with this number". */
  ghost?: boolean;
};

export type StoryVideoProps = {
  /** Shown as "1 · 1" over the opening beat. */
  driver: number;
  conductor: number;
  /** Five beats. Fewer renders fine; more will overrun the duration. */
  beats: StoryBeat[];
  ctaText: string;
  music: string;
  palette?: string;
  /** Total seconds. The pilot runs ~30s, not 60 — see the plan notes. */
  seconds?: number;
};

const FPS = 30;

const BeatText: React.FC<{ text: string; accent?: boolean }> = ({ text, accent }) => {
  const p = usePalette();
  const frame = useCurrentFrame();
  // Rise-and-settle rather than a fade: movement every beat is what keeps a
  // 30s video from feeling like a slideshow.
  const y = interpolate(frame, [0, 10], [26, 0], { extrapolateRight: "clamp" });
  const o = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 70,
        right: 70,
        transform: `translateY(${y}px)`,
        opacity: o,
        fontFamily: UI,
        fontSize: 62,
        lineHeight: 1.22,
        fontWeight: 600,
        color: accent ? p.ACCENT : p.TEXT,
        textShadow: p.TEXT_SHADOW,
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
};

export const StoryVideo: React.FC<StoryVideoProps> = ({
  driver,
  conductor,
  beats,
  ctaText,
  music,
  palette = "ink-violet",
  seconds = 30,
}) => {
  const total = Math.round(seconds * FPS);
  // Beats share the runtime evenly, minus a fixed CTA tail. Even division
  // keeps the cut grid regular, which is what lets the 150 BPM bed land on
  // the seams (see the beat-sync notes in brand.ts).
  const ctaFrames = Math.round(4 * FPS);
  const beatFrames = Math.floor((total - ctaFrames) / Math.max(beats.length, 1));

  return (
    <PaletteProvider name={palette}>
      <AbsoluteFill>
        <BrandAudio src={music} total={total} start={0} fadeIn={2} vol={0.44} fadeFloor={0.85} />
        <AstrolBackground rotationSpeed={5} particleDensity={70} />

        {beats.map((beat, i) => (
          <Sequence key={i} from={i * beatFrames} durationInFrames={beatFrames}>
            {/* The figure is the subject, so it gets the lower two-thirds and
                a scale that actually reads on a phone. The first cut of this
                rendered it at 120px in a 1080px frame — about 11% of the
                width — which on a handset is a speck in a lot of empty sky.
                Checked by rendering and looking, not by reading the JSX. */}
            <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 210 }}>
              {beat.ghost ? (
                <div style={{ position: "absolute", bottom: 210 }}>
                  <StoryFigure posture="burdened" progress={beat.progress - 0.22} scale={2.6} ghost />
                </div>
              ) : null}
              <StoryFigure posture={beat.posture} progress={beat.progress} scale={3} />
            </AbsoluteFill>
            {/* The turn is the payload, so it is the one beat in accent. */}
            <BeatText text={beat.text} accent={i === 2} />
          </Sequence>
        ))}

        {/* The combination, held across the whole opening beat. It first ran
            for 52 frames — under two seconds — and was gone before anyone
            could read it, which defeats the point of telling the right viewer
            this is about them. */}
        <Sequence durationInFrames={beatFrames}>
          <NumberBadge driver={driver} conductor={conductor} hold={beatFrames} />
        </Sequence>

        <Sequence from={total - ctaFrames} durationInFrames={ctaFrames}>
          <CTA text={ctaText} />
        </Sequence>
      </AbsoluteFill>
    </PaletteProvider>
  );
};

const NumberBadge: React.FC<{ driver: number; conductor: number; hold: number }> = ({
  driver,
  conductor,
  hold,
}) => {
  const p = usePalette();
  const frame = useCurrentFrame();
  // Visible for the whole beat, easing out only at the very end.
  const o = interpolate(frame, [0, 8, hold - 12, hold], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        width: "100%",
        textAlign: "center",
        opacity: o,
        fontFamily: DISPLAY,
        fontSize: 46,
        letterSpacing: 6,
        color: p.ACCENT,
      }}
    >
      {driver} · {conductor}
    </div>
  );
};

const CTA: React.FC<{ text: string }> = ({ text }) => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: o,
        fontFamily: DISPLAY,
        fontSize: 68,
        color: p.TEXT,
        textAlign: "center",
        padding: "0 90px",
        textShadow: p.TEXT_SHADOW,
      }}
    >
      {text}
    </AbsoluteFill>
  );
};
