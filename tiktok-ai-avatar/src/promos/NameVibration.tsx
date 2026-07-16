import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
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
import { hash } from "../lib/brand";
import { Surface } from "../components/vfx";

// Category 1 — Curiosity. Name → letter values → vibration waveform.
export const NAME_VIBRATION_DURATION = 600;

const LETTERS = [
  { l: "A", v: 1 },
  { l: "R", v: 2 },
  { l: "J", v: 1 },
  { l: "U", v: 6 },
  { l: "N", v: 5 },
];

const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pts = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * 900;
    const amp = 60 + hash(i) * 40;
    const y = 100 + Math.sin(i * 0.5 + t * 4) * amp * (0.5 + 0.5 * Math.sin(t * 1.5));
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 900 200" style={{ width: 900, height: 200 }}>
      <polyline points={pts} fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};

const Hook: React.FC = () => {
  const opacity = useSceneFade(96);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 74, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 84, fontWeight: 700, color: INK, lineHeight: 1.12 }}>
        <div>YOUR NAME HAS A</div>
        <div style={{ color: GOLD_TEXT }}>
          <KineticLetters text="HIDDEN" delay={12} />
        </div>
        <div style={{ color: GOLD_TEXT }}>
          <KineticLetters text="VIBRATION" delay={22} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Map: React.FC = () => {
  const opacity = useSceneFade(210);
  const frame = useCurrentFrame();
  const sum = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 70 }}>
      <Pop>
        <Eyebrow>Every letter is a number</Eyebrow>
      </Pop>
      <div style={{ marginTop: 60, display: "flex", gap: 20, justifyContent: "center" }}>
        {LETTERS.map((c, i) => (
          <Pop key={i} delay={14 + i * 12} y={26}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 140,
                  height: 160,
                  borderRadius: 20,
                  border: `2px solid ${GOLD}`,
                  background: "oklch(0.72 0.10 80 / 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SERIF,
                  fontSize: 84,
                  fontWeight: 700,
                  color: INK,
                }}
              >
                {c.l}
              </div>
              <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 42, fontWeight: 800, color: GOLD_TEXT }}>
                {c.v}
              </div>
            </div>
          </Pop>
        ))}
      </div>
      <div style={{ marginTop: 40, opacity: sum, textAlign: "center" }}>
        <span style={{ fontFamily: SANS, fontSize: 48, color: MUTED }}>1+2+1+6+5 = </span>
        <span style={{ fontFamily: SERIF, fontSize: 96, fontWeight: 700, color: GOLD }}>15 → 6</span>
      </div>
    </AbsoluteFill>
  );
};

const Vibe: React.FC = () => {
  const opacity = useSceneFade(174);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 70, textAlign: "center" }}>
      <Pop>
        <div style={{ fontFamily: SANS, fontSize: 40, letterSpacing: 5, color: GOLD_TEXT, fontWeight: 700 }}>
          YOUR NAME'S FREQUENCY
        </div>
      </Pop>
      <Pop delay={10}>
        <div style={{ marginTop: 30 }}>
          <Waveform />
        </div>
      </Pop>
      <Pop delay={22} y={20}>
        <div style={{ marginTop: 30, fontFamily: SERIF, fontSize: 60, fontWeight: 700, color: INK, lineHeight: 1.15 }}>
          It's either working <span style={{ color: GREEN }}>with</span> you
          <br />
          or <span style={{ color: GOLD_TEXT }}>against</span> you.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const opacity = useSceneFade(120, 14, 10);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90 }}>
      <BrandCTA variant="cream" tagline="Tune your name → numevix.com" />
    </AbsoluteFill>
  );
};

export const NameVibration: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.miracle} total={NAME_VIBRATION_DURATION} vol={0.5} />
    <Surface variant="cream" particles />
    <Sequence durationInFrames={96}>
      <Hook />
    </Sequence>
    <Sequence from={96} durationInFrames={210}>
      <Map />
    </Sequence>
    <Sequence from={306} durationInFrames={174}>
      <Vibe />
    </Sequence>
    <Sequence from={480} durationInFrames={120}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
