import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  GOLD_TEXT,
  GREEN,
  INK,
  INK_SOFT,
  MUSIC,
  MUTED,
  SANS,
  SERIF,
} from "../lib/brand";
import {
  BrandAudio,
  BrandCTA,
  KineticLetters,
  Pop,
  useSceneFade,
} from "../components/kit";
import { Surface } from "../components/vfx";

// Category 6 — Emotional self-discovery. Slow, cinematic, premium.
export const BORN_WITH_STRENGTHS_DURATION = 720;

const LINES = [
  "You were handed a set of numbers",
  "the day you were born.",
  "They quietly shape how you love,",
  "how you work, how you fall —",
  "and how you rise again.",
];

// Slow line-by-line cinematic fade
const Story: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useSceneFade(330, 20, 20);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90, textAlign: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {LINES.map((line, i) => {
          const start = 10 + i * 56;
          const o = interpolate(frame, [start, start + 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [start, start + 30], [24, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const gold = i === LINES.length - 1;
          return (
            <div
              key={i}
              style={{
                opacity: o,
                transform: `translateY(${y}px)`,
                fontFamily: SERIF,
                fontSize: 62,
                fontWeight: 700,
                lineHeight: 1.25,
                color: gold ? GOLD_TEXT : INK_SOFT,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const opacity = useSceneFade(120, 18, 16);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 80, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 88, fontWeight: 700, color: INK, lineHeight: 1.14 }}>
        <div>YOU WERE BORN</div>
        <div>WITH STRENGTHS</div>
        <div style={{ color: GOLD_TEXT }}>
          <KineticLetters text="NO ONE TOLD YOU" delay={14} stagger={2} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Affirm: React.FC = () => {
  const opacity = useSceneFade(150, 16, 16);
  const words = ["Intuitive.", "Resilient.", "Magnetic.", "Built to lead."];
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 80, textAlign: "center" }}>
      <Pop>
        <div style={{ fontFamily: SANS, fontSize: 38, letterSpacing: 5, color: GOLD_TEXT, fontWeight: 700, textTransform: "uppercase" }}>
          Your numbers say
        </div>
      </Pop>
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14 }}>
        {words.map((w, i) => (
          <Pop key={w} delay={16 + i * 20} y={20}>
            <div style={{ fontFamily: SERIF, fontSize: 84, fontWeight: 700, color: i % 2 ? GREEN : INK }}>{w}</div>
          </Pop>
        ))}
      </div>
      <Pop delay={110} y={16}>
        <div style={{ marginTop: 40, fontFamily: SANS, fontSize: 38, color: MUTED, lineHeight: 1.4 }}>
          Understanding them changes
          <br />
          how you see yourself.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const opacity = useSceneFade(120, 16, 12);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90 }}>
      <BrandCTA variant="cream" tagline="Meet yourself → numevix.com" />
    </AbsoluteFill>
  );
};

export const BornWithStrengths: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.sweetMemories} total={BORN_WITH_STRENGTHS_DURATION} vol={0.46} />
    <Surface variant="cream" particles />
    <Sequence durationInFrames={120}>
      <Hook />
    </Sequence>
    <Sequence from={120} durationInFrames={330}>
      <Story />
    </Sequence>
    <Sequence from={450} durationInFrames={150}>
      <Affirm />
    </Sequence>
    <Sequence from={600} durationInFrames={120}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
