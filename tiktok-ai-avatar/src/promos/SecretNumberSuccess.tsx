import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  CREAM_ON_DARK,
  GOLD,
  MUSIC,
  MUTED_ON_DARK,
  SANS,
  SERIF,
} from "../lib/brand";
import {
  BrandAudio,
  BrandCTA,
  Eyebrow,
  GlowRing,
  KineticLetters,
  Pop,
  useSceneFade,
} from "../components/kit";
import { ConvergingParticles, Surface } from "../components/vfx";

// Category 2 — "Celebrity" template. Archetypal + framed strictly as interpretation
// (no unsupported claims, no real likeness). Swap SUBJECT/TRAITS to feature a figure.
export const SECRET_NUMBER_DURATION = 660;

const SUBJECT = "THE WORLD'S BUILDERS";
const TRAITS = [
  "Wired for material success",
  "Relentless, patient ambition",
  "Turn pressure into empire",
  "Rewarded late — but big",
];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useSceneFade(110);
  const conv = interpolate(frame, [0, 84], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 74, textAlign: "center" }}>
      <ConvergingParticles progress={conv} />
      <div style={{ fontFamily: SERIF, fontSize: 92, fontWeight: 700, color: CREAM_ON_DARK, lineHeight: 1.1 }}>
        <div>THE SECRET</div>
        <div style={{ color: GOLD }}>
          <KineticLetters text="NUMBER" delay={12} />
        </div>
        <div>BEHIND</div>
        <div style={{ fontSize: 60, marginTop: 10, color: MUTED_ON_DARK }}>{SUBJECT}</div>
      </div>
    </AbsoluteFill>
  );
};

const Reveal: React.FC = () => {
  const opacity = useSceneFade(150);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center" }}>
      <GlowRing size={620} color={GOLD} spin={40} />
      <Pop>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 440,
            lineHeight: 0.9,
            fontWeight: 700,
            color: GOLD,
            textShadow: "0 8px 46px oklch(0.72 0.10 80 / 0.45)",
          }}
        >
          8
        </div>
      </Pop>
      <Pop delay={90} y={18} style={{ position: "absolute", bottom: 300 }}>
        <div style={{ fontFamily: SANS, fontSize: 46, color: CREAM_ON_DARK, fontWeight: 700, textAlign: "center" }}>
          The number of Saturn.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const Traits: React.FC = () => {
  const opacity = useSceneFade(280);
  return (
    <AbsoluteFill style={{ opacity, padding: "160px 88px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow color={GOLD}>In numerology, an 8 reads as</Eyebrow>
      </Pop>
      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 30 }}>
        {TRAITS.map((s, i) => (
          <Pop key={s} delay={16 + i * 20} y={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span style={{ color: GOLD, fontFamily: SERIF, fontSize: 52, fontWeight: 700, width: 46 }}>
                {i + 1}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 46, fontWeight: 600, color: CREAM_ON_DARK }}>{s}</span>
            </div>
          </Pop>
        ))}
      </div>
      <Pop delay={120} y={14}>
        <div style={{ marginTop: 50, fontFamily: SANS, fontSize: 30, fontStyle: "italic", color: MUTED_ON_DARK }}>
          A numerology interpretation — not a claim of fact.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const opacity = useSceneFade(120, 14, 10);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90 }}>
      <BrandCTA variant="ink" kicker="Your birthday hides a number too." tagline="Find your own → numevix.com" />
    </AbsoluteFill>
  );
};

export const SecretNumberSuccess: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.dark} total={SECRET_NUMBER_DURATION} start={0} fadeIn={4} vol={0.5} />
    <Surface variant="ink" />
    <Sequence durationInFrames={110}>
      <Hook />
    </Sequence>
    <Sequence from={110} durationInFrames={150}>
      <Reveal />
    </Sequence>
    <Sequence from={260} durationInFrames={280}>
      <Traits />
    </Sequence>
    <Sequence from={540} durationInFrames={120}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
