import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {
  ALERT,
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
  KineticLetters,
  Pop,
  useSceneFade,
} from "../components/kit";
import { ConvergingParticles, Surface } from "../components/vfx";

// Category 1 — Curiosity hook. Ties directly to the Numevix Name Correction product.
export const NAME_BLOCKING_DURATION = 660;

const NAME = [
  { l: "S", v: 3, clash: false },
  { l: "A", v: 1, clash: false },
  { l: "R", v: 2, clash: true },
  { l: "A", v: 1, clash: false },
  { l: "H", v: 5, clash: false },
];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useSceneFade(100);
  const conv = interpolate(frame, [0, 78], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        opacity,
        alignItems: "center",
        justifyContent: "center",
        padding: 70,
        textAlign: "center",
      }}
    >
      <ConvergingParticles progress={conv} />
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 96,
          fontWeight: 700,
          color: CREAM_ON_DARK,
          lineHeight: 1.08,
        }}
      >
        <div>YOUR NAME</div>
        <div>MAY BE</div>
        <div style={{ color: ALERT }}>
          <KineticLetters text="BLOCKING" delay={14} />
        </div>
        <div>
          YOUR <span style={{ color: GOLD }}>SUCCESS</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Decode: React.FC = () => {
  const opacity = useSceneFade(230);
  return (
    <AbsoluteFill
      style={{ opacity, padding: "160px 80px", justifyContent: "flex-start" }}
    >
      <Pop>
        <Eyebrow>Every name carries a vibration</Eyebrow>
      </Pop>
      <div
        style={{
          marginTop: 90,
          display: "flex",
          justifyContent: "center",
          gap: 22,
        }}
      >
        {NAME.map((c, i) => (
          <Pop key={i} delay={14 + i * 12} y={30}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 150,
                  height: 180,
                  borderRadius: 22,
                  border: `2px solid ${c.clash ? ALERT : GOLD}`,
                  background: c.clash
                    ? "oklch(0.58 0.15 28 / 0.14)"
                    : "oklch(0.72 0.10 80 / 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SERIF,
                  fontSize: 96,
                  fontWeight: 700,
                  color: c.clash ? ALERT : CREAM_ON_DARK,
                }}
              >
                {c.l}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: SANS,
                  fontSize: 46,
                  fontWeight: 800,
                  color: c.clash ? ALERT : GOLD,
                }}
              >
                {c.v}
              </div>
            </div>
          </Pop>
        ))}
      </div>
      <Pop delay={96} y={24}>
        <div
          style={{
            marginTop: 80,
            textAlign: "center",
            fontFamily: SANS,
            fontSize: 44,
            lineHeight: 1.45,
            color: MUTED_ON_DARK,
          }}
        >
          One letter out of tune can quietly
          <br />
          <span style={{ color: ALERT, fontWeight: 700 }}>
            work against everything you build.
          </span>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const Solution: React.FC = () => {
  const opacity = useSceneFade(190);
  const options = [
    { name: "SAARAH", score: 92 },
    { name: "SARRAH", score: 88 },
  ];
  return (
    <AbsoluteFill
      style={{ opacity, padding: "170px 90px", justifyContent: "flex-start" }}
    >
      <Pop>
        <Eyebrow color={GREEN}>Numevix name correction</Eyebrow>
      </Pop>
      <Pop delay={6}>
        <div
          style={{
            marginTop: 18,
            fontFamily: SERIF,
            fontSize: 72,
            fontWeight: 700,
            color: CREAM_ON_DARK,
            lineHeight: 1.1,
          }}
        >
          Tuned spellings, <span style={{ color: GOLD }}>scored.</span>
        </div>
      </Pop>
      <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 30 }}>
        {options.map((o, i) => (
          <Pop key={o.name} delay={28 + i * 26} y={34}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "oklch(0.28 0.03 162)",
                border: `2px solid ${GREEN}`,
                borderRadius: 22,
                padding: "30px 40px",
              }}
            >
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 68,
                  fontWeight: 700,
                  color: CREAM_ON_DARK,
                  letterSpacing: 3,
                }}
              >
                {o.name}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: SANS, fontSize: 60, fontWeight: 800, color: GOLD }}>
                  {o.score}
                </span>
                <span
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: GREEN,
                    color: "#fff",
                    fontSize: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </span>
              </span>
            </div>
          </Pop>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const opacity = useSceneFade(140, 14, 10);
  return (
    <AbsoluteFill
      style={{
        opacity,
        alignItems: "center",
        justifyContent: "center",
        padding: 90,
      }}
    >
      <BrandCTA
        variant="ink"
        kicker="Your name could be your edge."
        tagline="Get your name corrected → numevix.com"
      />
    </AbsoluteFill>
  );
};

export const NameBlockingSuccess: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.darkCinematic} total={NAME_BLOCKING_DURATION} start={96} fadeIn={4} vol={0.52} />
    <Surface variant="ink" />
    <Sequence durationInFrames={100}>
      <Hook />
    </Sequence>
    <Sequence from={100} durationInFrames={230}>
      <Decode />
    </Sequence>
    <Sequence from={330} durationInFrames={190}>
      <Solution />
    </Sequence>
    <Sequence from={520} durationInFrames={140}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
