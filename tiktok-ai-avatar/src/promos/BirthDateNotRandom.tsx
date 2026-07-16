import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {
  GOLD,
  GOLD_TEXT,
  GREEN,
  INK,
  MUSIC,
  MUTED,
  SANS,
  SERIF,
} from "../lib/brand";
import {
  BrandAudio,
  BrandCTA,
  Eyebrow,
  KineticLetters,
  Pop,
  useSceneFade,
} from "../components/kit";
import { Surface } from "../components/vfx";

// Category 1 — Curiosity. Animated reduction of a birth date into a Moolank.
export const BIRTHDATE_DURATION = 600;

const STRENGTHS = ["Sharp & quick-witted", "A magnetic communicator", "Born for business", "Adaptable to anything"];

const Hook: React.FC = () => {
  const opacity = useSceneFade(96);
  return (
    <AbsoluteFill
      style={{ opacity, alignItems: "center", justifyContent: "center", padding: 74, textAlign: "center" }}
    >
      <div style={{ fontFamily: SERIF, fontSize: 82, fontWeight: 700, color: INK, lineHeight: 1.12 }}>
        <div>YOUR BIRTH DATE</div>
        <div>WAS NOT A</div>
        <div style={{ color: GOLD_TEXT }}>
          <KineticLetters text="RANDOM NUMBER" delay={12} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Reduce: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useSceneFade(264);
  // Phase A: 14 → 1 + 4  ·  Phase B (crossfade): reveal Moolank 5
  const step2 = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mathOut = interpolate(frame, [104, 126], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reveal = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Eyebrow pinned to the upper third */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 360 }}>
        <Pop>
          <Eyebrow>Born on the 14th?</Eyebrow>
        </Pop>
      </AbsoluteFill>

      {/* Phase A — the math (fades up and out) */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: mathOut,
          transform: `translateY(${(1 - mathOut) * -40}px)`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 170, fontWeight: 700, color: INK, letterSpacing: 6 }}>14</div>
          <div style={{ opacity: step2, fontFamily: SANS, fontSize: 96, fontWeight: 700, color: MUTED, marginTop: 16 }}>
            1 + 4
          </div>
        </div>
      </AbsoluteFill>

      {/* Phase B — the Moolank reveal (fades in, centered, no overlap) */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: reveal,
          transform: `scale(${0.72 + reveal * 0.28})`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontSize: 40, letterSpacing: 5, color: GOLD_TEXT, fontWeight: 700 }}>
            YOUR MOOLANK
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 250,
              lineHeight: 1,
              fontWeight: 700,
              color: GOLD,
              margin: "8px 0 18px",
              textShadow: "0 6px 30px oklch(0.72 0.10 80 / 0.35)",
            }}
          >
            5
          </div>
          <div style={{ fontFamily: SANS, fontSize: 44, color: INK, fontWeight: 600 }}>Ruled by Mercury</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Meaning: React.FC = () => {
  const opacity = useSceneFade(120);
  return (
    <AbsoluteFill style={{ opacity, padding: "220px 90px", justifyContent: "flex-start" }}>
      <Pop>
        <div style={{ fontFamily: SERIF, fontSize: 74, fontWeight: 700, color: INK, lineHeight: 1.1 }}>
          What a <span style={{ color: GOLD_TEXT }}>5</span> is wired for:
        </div>
      </Pop>
      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 26 }}>
        {STRENGTHS.map((s, i) => (
          <Pop key={s} delay={14 + i * 14} y={26}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <span style={{ color: GREEN, fontSize: 44 }}>✓</span>
              <span style={{ fontFamily: SANS, fontSize: 46, fontWeight: 600, color: INK }}>{s}</span>
            </div>
          </Pop>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const opacity = useSceneFade(120, 14, 10);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90 }}>
      <BrandCTA variant="cream" kicker="Every digit means something." tagline="Reduce your date free → numevix.com" />
    </AbsoluteFill>
  );
};

export const BirthDateNotRandom: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.perfectMoment} total={BIRTHDATE_DURATION} start={0} fadeIn={16} vol={0.5} />
    <Surface variant="cream" />
    <Sequence durationInFrames={96}>
      <Hook />
    </Sequence>
    <Sequence from={96} durationInFrames={264}>
      <Reduce />
    </Sequence>
    <Sequence from={360} durationInFrames={120}>
      <Meaning />
    </Sequence>
    <Sequence from={480} durationInFrames={120}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
