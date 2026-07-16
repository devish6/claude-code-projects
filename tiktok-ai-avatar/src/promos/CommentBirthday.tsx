import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  GOLD,
  GOLD_TEXT,
  GREEN,
  GREEN_FG,
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

// Category 3 — Interactive comment-bait. Calendar dates light up; drives comments.
export const COMMENT_BIRTHDAY_DURATION = 540;

const HIGHLIGHT = [5, 14, 23]; // Moolank 5 dates
const TRAITS = ["Quick-witted", "Magnetic", "Restless", "Born to sell"];

const Hook: React.FC = () => {
  const opacity = useSceneFade(96);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 74, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 96, fontWeight: 700, color: INK, lineHeight: 1.08 }}>
        <div>STOP SCROLLING</div>
        <div>IF YOU WERE</div>
        <div style={{ color: GOLD_TEXT }}>
          <KineticLetters text="BORN ON THESE" delay={12} />
        </div>
        <div style={{ color: GOLD_TEXT }}>DATES</div>
      </div>
    </AbsoluteFill>
  );
};

const Calendar: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useSceneFade(210);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 70 }}>
      <Pop>
        <Eyebrow>The 5, 14 & 23 club</Eyebrow>
      </Pop>
      <div
        style={{
          marginTop: 50,
          display: "grid",
          gridTemplateColumns: "repeat(7, 118px)",
          gap: 14,
          justifyContent: "center",
        }}
      >
        {days.map((d) => {
          const on = HIGHLIGHT.includes(d);
          const lit = on
            ? interpolate(frame, [20 + d, 34 + d], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;
          return (
            <div
              key={d}
              style={{
                height: 118,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SANS,
                fontSize: 46,
                fontWeight: on ? 800 : 500,
                color: on ? GREEN_FG : MUTED,
                background: on ? GREEN : "oklch(0.995 0.004 85)",
                border: `1px solid ${on ? GREEN : "oklch(0.87 0.02 85)"}`,
                transform: on ? `scale(${0.9 + lit * 0.18})` : "none",
                boxShadow: on ? "0 12px 30px -12px oklch(0.52 0.085 158 / 0.6)" : "none",
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Traits: React.FC = () => {
  const opacity = useSceneFade(114);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 80, textAlign: "center" }}>
      <Pop>
        <div style={{ fontFamily: SERIF, fontSize: 70, fontWeight: 700, color: INK }}>
          Then this is <span style={{ color: GOLD_TEXT }}>you</span>:
        </div>
      </Pop>
      <div style={{ marginTop: 44, display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 900 }}>
        {TRAITS.map((s, i) => (
          <Pop key={s} delay={12 + i * 12} y={22}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 44,
                fontWeight: 700,
                color: INK,
                background: "oklch(0.72 0.10 80 / 0.14)",
                border: `2px solid ${GOLD}`,
                borderRadius: 50,
                padding: "18px 38px",
              }}
            >
              {s}
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
      <BrandCTA
        variant="cream"
        kicker="👇 Comment your birthday"
        tagline="Free chart → numevix.com"
      />
    </AbsoluteFill>
  );
};

export const CommentBirthday: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.inspiringCorporate} total={COMMENT_BIRTHDAY_DURATION} vol={0.5} />
    <Surface variant="cream" />
    <Sequence durationInFrames={96}>
      <Hook />
    </Sequence>
    <Sequence from={96} durationInFrames={210}>
      <Calendar />
    </Sequence>
    <Sequence from={306} durationInFrames={114}>
      <Traits />
    </Sequence>
    <Sequence from={420} durationInFrames={120}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
