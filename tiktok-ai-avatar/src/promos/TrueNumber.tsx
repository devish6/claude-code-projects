import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  CREAM_ON_DARK,
  GOLD,
  GREEN,
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
import { DigitScramble, Surface } from "../components/vfx";

// Category 1 — Curiosity. "Most people don't know their true number."
export const TRUE_NUMBER_DURATION = 540;

const THREE = [
  { label: "Driver", desc: "who you are", n: "5" },
  { label: "Conductor", desc: "where life takes you", n: "8" },
  { label: "Name", desc: "how the world meets you", n: "3" },
];

const Hook: React.FC = () => {
  const opacity = useSceneFade(96);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 74, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 98, fontWeight: 700, color: CREAM_ON_DARK, lineHeight: 1.08 }}>
        <div>MOST PEOPLE</div>
        <div>DON'T KNOW</div>
        <div style={{ color: GOLD }}>
          <KineticLetters text="THEIR TRUE" delay={12} />
        </div>
        <div style={{ color: GOLD }}>
          <KineticLetters text="NUMBER" delay={26} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scramble: React.FC = () => {
  const opacity = useSceneFade(150);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center" }}>
      <GlowRing size={640} color={GOLD} spin={50} />
      <Pop>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 460,
            lineHeight: 0.9,
            fontWeight: 700,
            color: GOLD,
            textShadow: "0 8px 46px oklch(0.72 0.10 80 / 0.45)",
          }}
        >
          <DigitScramble to={5} settleAt={92} />
        </div>
      </Pop>
      <Pop delay={96} y={20} style={{ position: "absolute", bottom: 260 }}>
        <div style={{ fontFamily: SANS, fontSize: 44, color: MUTED_ON_DARK, textAlign: "center" }}>
          It was never just <span style={{ color: CREAM_ON_DARK, fontWeight: 700 }}>one</span> number.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const Three: React.FC = () => {
  const opacity = useSceneFade(174);
  return (
    <AbsoluteFill style={{ opacity, padding: "150px 84px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow color={GOLD}>Three numbers rule your life</Eyebrow>
      </Pop>
      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 26 }}>
        {THREE.map((r, i) => (
          <Pop key={r.label} delay={16 + i * 22} y={34}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                background: "oklch(0.28 0.03 162)",
                border: "1px solid oklch(0.72 0.10 80 / 0.4)",
                borderRadius: 22,
                padding: "26px 34px",
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: `2px solid ${GOLD}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SERIF,
                  fontSize: 64,
                  fontWeight: 700,
                  color: GOLD,
                  flexShrink: 0,
                }}
              >
                {r.n}
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 48, fontWeight: 800, color: CREAM_ON_DARK }}>
                  {r.label} number
                </div>
                <div style={{ fontFamily: SANS, fontSize: 36, color: MUTED_ON_DARK }}>{r.desc}</div>
              </div>
            </div>
          </Pop>
        ))}
      </div>
      <Pop delay={120} y={16}>
        <div style={{ marginTop: 46, textAlign: "center", fontFamily: SANS, fontSize: 40, color: GREEN, fontWeight: 700 }}>
          Numevix reads all three in one chart.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const opacity = useSceneFade(120, 14, 10);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90 }}>
      <BrandCTA variant="ink" tagline="Find your true number → numevix.com" />
    </AbsoluteFill>
  );
};

export const TrueNumber: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.darkMystical} total={TRUE_NUMBER_DURATION} start={0} fadeIn={6} vol={0.5} />
    <Surface variant="ink" />
    <Sequence durationInFrames={96}>
      <Hook />
    </Sequence>
    <Sequence from={96} durationInFrames={150}>
      <Scramble />
    </Sequence>
    <Sequence from={246} durationInFrames={174}>
      <Three />
    </Sequence>
    <Sequence from={420} durationInFrames={120}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
