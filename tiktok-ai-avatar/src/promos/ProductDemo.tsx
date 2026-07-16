import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  BORDER,
  CARD,
  CREAM_ON_DARK,
  GOLD,
  GOLD_TEXT,
  GREEN,
  INK,
  MUSIC,
  MUTED,
  MUTED_ON_DARK,
  SANS,
  SERIF,
} from "../lib/brand";
import { BrandAudio, BrandCTA, Eyebrow, Pop, useSceneFade } from "../components/kit";
import { NeuralNet, Surface } from "../components/vfx";

// Category 4 — Product demonstration. The full user journey.
export const PRODUCT_DEMO_DURATION = 780;

const FIELDS = [
  { label: "Full name", value: "Arjun Mehta" },
  { label: "Date of birth", value: "14 · 08 · 1996" },
  { label: "Time of birth", value: "07:42 AM" },
];

const REPORT = [
  { k: "Life Path", v: "5", d: "The free spirit" },
  { k: "Destiny", v: "8", d: "The achiever" },
  { k: "Soul Urge", v: "3", d: "The expressive" },
  { k: "Name harmony", v: "82", d: "Well tuned" },
];

const Input: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useSceneFade(210);
  return (
    <AbsoluteFill style={{ opacity, padding: "180px 80px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow>Step 1 · Tell Numevix who you are</Eyebrow>
      </Pop>
      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 30 }}>
        {FIELDS.map((f, i) => {
          const typed = interpolate(frame, [24 + i * 34, 60 + i * 34], [0, f.value.length], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const caret = Math.floor(frame / 8) % 2 === 0;
          return (
            <Pop key={f.label} delay={14 + i * 14} y={30}>
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 20,
                  padding: "24px 30px",
                }}
              >
                <div style={{ fontFamily: SANS, fontSize: 30, color: MUTED, letterSpacing: 2, textTransform: "uppercase" }}>
                  {f.label}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 58, fontWeight: 700, color: INK, marginTop: 6 }}>
                  {f.value.slice(0, Math.round(typed))}
                  <span style={{ color: GOLD, opacity: caret ? 1 : 0 }}>|</span>
                </div>
              </div>
            </Pop>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Processing: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useSceneFade(180);
  const pct = Math.round(
    interpolate(frame, [10, 150], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      <Surface variant="ink" />
      <NeuralNet opacity={0.9} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 }}>
        <Pop>
          <div style={{ fontFamily: SANS, fontSize: 40, letterSpacing: 5, color: GOLD, fontWeight: 700 }}>
            STEP 2 · AI IS READING YOUR CHART
          </div>
        </Pop>
        <div style={{ fontFamily: SERIF, fontSize: 220, fontWeight: 700, color: CREAM_ON_DARK, marginTop: 20 }}>
          {pct}%
        </div>
        <div style={{ width: 620, height: 12, borderRadius: 8, background: "oklch(0.3 0.02 165)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: GOLD }} />
        </div>
        <div style={{ marginTop: 26, fontFamily: SANS, fontSize: 34, color: MUTED_ON_DARK }}>
          Cross-checking 81 number combinations…
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Report: React.FC = () => {
  const opacity = useSceneFade(210);
  return (
    <AbsoluteFill style={{ opacity, padding: "150px 80px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow color={GREEN}>Step 3 · Your personalized report</Eyebrow>
      </Pop>
      <Pop delay={6}>
        <div style={{ fontFamily: SERIF, fontSize: 66, fontWeight: 700, color: INK, marginTop: 14 }}>
          Arjun's core numbers
        </div>
      </Pop>
      <div
        style={{
          marginTop: 44,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22,
        }}
      >
        {REPORT.map((r, i) => (
          <Pop key={r.k} delay={20 + i * 16} y={30}>
            <div
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 22,
                padding: "28px 30px",
                boxShadow: "0 12px 30px -18px oklch(0.24 0.012 60 / 0.3)",
              }}
            >
              <div style={{ fontFamily: SANS, fontSize: 30, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>
                {r.k}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 96, fontWeight: 700, color: GOLD, lineHeight: 1 }}>
                {r.v}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 34, color: INK, fontWeight: 600 }}>{r.d}</div>
            </div>
          </Pop>
        ))}
      </div>
      <Pop delay={96} y={16}>
        <div style={{ marginTop: 40, fontFamily: SANS, fontSize: 36, color: GOLD_TEXT, fontWeight: 700, textAlign: "center" }}>
          Written in plain English · reviewed by real experts
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const opacity = useSceneFade(180, 14, 10);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90 }}>
      <BrandCTA variant="cream" tagline="Get your report → numevix.com" />
    </AbsoluteFill>
  );
};

export const ProductDemo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#F3F2EC" }}>
    <BrandAudio src={MUSIC.ambientAtmosphere} total={PRODUCT_DEMO_DURATION} vol={0.5} />
    <Sequence durationInFrames={210}>
      <AbsoluteFill>
        <Surface variant="cream" />
        <Input />
      </AbsoluteFill>
    </Sequence>
    <Sequence from={210} durationInFrames={180}>
      <Processing />
    </Sequence>
    <Sequence from={390} durationInFrames={210}>
      <AbsoluteFill>
        <Surface variant="cream" />
        <Report />
      </AbsoluteFill>
    </Sequence>
    <Sequence from={600} durationInFrames={180}>
      <AbsoluteFill>
        <Surface variant="cream" />
        <CTA />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);
