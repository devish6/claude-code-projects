import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { DISPLAY, UI } from "../fonts";
import { ACCENT, TEXT, TEXT_SHADOW } from "../palette";
import { Snap, useCameraDrift, useGlowPulse } from "../motion";

/**
 * The loop engine: setup → a held light beat → reveal.
 *
 * The pause is the mechanism. A held blank beat before the reveal is what makes
 * the viewer wait instead of scroll — it signals "something is coming" more
 * strongly than any animation can. Keep `pauseDuration` short (8–15 frames);
 * longer than ~0.5s and it reads as a loading glitch.
 *
 * The reveal deliberately does NOT resolve the question — it escalates it.
 */
export const CuriosityGap: React.FC<{
  setup: string;
  reveal: string;
  /** Frames of dark beat between the two. */
  pauseDuration?: number;
  setupDuration?: number;
  durationInFrames: number;
}> = ({
  setup,
  reveal,
  pauseDuration = 10,
  setupDuration = 66,
  durationInFrames,
}) => {
  const revealStart = setupDuration + pauseDuration;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={setupDuration} layout="none">
        <GapLine text={setup} kind="setup" durationInFrames={setupDuration} />
      </Sequence>

      <Sequence from={setupDuration} durationInFrames={pauseDuration} layout="none">
        <Beat />
      </Sequence>

      <Sequence
        from={revealStart}
        durationInFrames={durationInFrames - revealStart}
        layout="none"
      >
        <GapLine
          text={reveal}
          kind="reveal"
          durationInFrames={durationInFrames - revealStart}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

const GapLine: React.FC<{
  text: string;
  kind: "setup" | "reveal";
  durationInFrames: number;
}> = ({ text, kind, durationInFrames }) => {
  const isReveal = kind === "reveal";
  const scale = useCameraDrift(durationInFrames, 1, isReveal ? 1.07 : 1.04);
  const glow = useGlowPulse("rgba(120,88,24,0.34)", 1.4);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        textAlign: "center",
        transform: `scale(${scale})`,
      }}
    >
      <Snap from={isReveal ? 0.7 : 0.85} y={isReveal ? 20 : 34} config={isReveal ? "burst" : "snap"}>
        <div
          style={{
            fontFamily: isReveal ? DISPLAY : UI,
            fontSize: isReveal ? 100 : 80,
            fontWeight: isReveal ? 900 : 700,
            lineHeight: 1.1,
            color: isReveal ? ACCENT : TEXT,
            textShadow: isReveal ? glow : TEXT_SHADOW,
          }}
        >
          {text}
        </div>
      </Snap>
    </AbsoluteFill>
  );
};

/**
 * The held beat.
 *
 * On the light sage ground this goes DARK, not lighter. A near-white wash
 * blows the frame out and reads as an encoding glitch; a deep ink wash reads
 * as a deliberate blink. Alpha stays under ~0.7 so the dial stays faintly
 * visible underneath and the viewer can tell the video hasn't cut out.
 */
const Beat: React.FC = () => {
  const frame = useCurrentFrame();
  // A single scanline sweep keeps even the pause in motion.
  const y = 40 + frame * 6;
  return (
    <AbsoluteFill style={{ background: "rgba(28,32,22,0.66)" }}>
      <div
        style={{
          position: "absolute",
          top: `${y}%`,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(240,214,150,0.55)",
          boxShadow: "0 0 40px rgba(240,214,150,0.45)",
        }}
      />
    </AbsoluteFill>
  );
};
