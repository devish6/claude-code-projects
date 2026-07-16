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
import { Surface } from "../components/vfx";

// Category 5 — Educational. Why 7 is the "mysterious" number (Ketu, the seeker).
export const WHY_SEVEN_DURATION = 600;

const POINTS = [
  "Ruled by Ketu — the point of detachment",
  "The seeker: drawn to what can't be seen",
  "Reads people without a word spoken",
  "Happiest alone, yet quietly magnetic",
];

const Hook: React.FC = () => {
  const opacity = useSceneFade(96);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 74, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 100, fontWeight: 700, color: CREAM_ON_DARK, lineHeight: 1.08 }}>
        <div>WHY NUMBER 7</div>
        <div>IS THE MOST</div>
        <div style={{ color: GOLD }}>
          <KineticLetters text="MYSTERIOUS" delay={12} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Seven: React.FC = () => {
  const opacity = useSceneFade(120);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center" }}>
      <GlowRing size={620} color={GOLD} spin={30} />
      <Pop>
        <div style={{ fontFamily: SERIF, fontSize: 440, fontWeight: 700, color: GOLD, textShadow: "0 8px 46px oklch(0.72 0.10 80 / 0.45)" }}>
          7
        </div>
      </Pop>
      <Pop delay={80} style={{ position: "absolute", bottom: 280 }}>
        <div style={{ fontFamily: SANS, fontSize: 44, color: MUTED_ON_DARK, textAlign: "center" }}>
          The number that looks <span style={{ color: CREAM_ON_DARK, fontWeight: 700 }}>inward.</span>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const Points: React.FC = () => {
  const opacity = useSceneFade(234);
  return (
    <AbsoluteFill style={{ opacity, padding: "170px 84px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow color={GOLD}>What makes a 7 different</Eyebrow>
      </Pop>
      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 32 }}>
        {POINTS.map((s, i) => (
          <Pop key={s} delay={16 + i * 20} y={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  border: `2px solid ${GREEN}`,
                  color: GREEN,
                  fontSize: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✦
              </span>
              <span style={{ fontFamily: SANS, fontSize: 44, fontWeight: 600, color: CREAM_ON_DARK, lineHeight: 1.3 }}>
                {s}
              </span>
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
      <BrandCTA variant="ink" kicker="Is 7 in your chart?" tagline="Explore your numbers → numevix.com" />
    </AbsoluteFill>
  );
};

export const WhySeven: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.tribalRitual} total={WHY_SEVEN_DURATION} vol={0.44} />
    <Surface variant="ink" />
    <Sequence durationInFrames={96}>
      <Hook />
    </Sequence>
    <Sequence from={96} durationInFrames={150}>
      <Seven />
    </Sequence>
    <Sequence from={246} durationInFrames={234}>
      <Points />
    </Sequence>
    <Sequence from={480} durationInFrames={120}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
