import React from "react";
import { AbsoluteFill } from "remotion";
import {
  CREAM_ON_DARK,
  GOLD,
  GOLD_TEXT,
  GREEN,
  GREEN_FG,
  INK,
  MUTED,
  MUTED_ON_DARK,
  SANS,
  SERIF,
} from "../lib/brand";
import { Surface } from "../components/vfx";

// Static 1080x1920 branded thumbnail / cover for a promo. Parameterized by props
// so one composition renders all 10 covers via `remotion still Cover --props=...`.
export type CoverProps = {
  variant: "cream" | "ink";
  kicker: string;
  title: string;
  accent: string; // emphasized (gold) line
  watermark?: string; // big faint number in the corner
};

export const Cover: React.FC<CoverProps> = ({
  variant,
  kicker,
  title,
  accent,
  watermark,
}) => {
  const onInk = variant === "ink";
  const fg = onInk ? CREAM_ON_DARK : INK;
  const kickerCol = onInk ? GOLD : GOLD_TEXT;
  const subCol = onInk ? MUTED_ON_DARK : MUTED;

  return (
    <AbsoluteFill style={{ backgroundColor: onInk ? "#12211c" : "#F3F2EC" }}>
      <Surface variant={variant} />

      {watermark ? (
        <div
          style={{
            position: "absolute",
            right: -60,
            bottom: 180,
            fontFamily: SERIF,
            fontSize: 620,
            fontWeight: 700,
            color: GOLD,
            opacity: onInk ? 0.12 : 0.09,
            lineHeight: 0.8,
          }}
        >
          {watermark}
        </div>
      ) : null}

      {/* Headline block, centered */}
      <AbsoluteFill
        style={{
          padding: 70,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 34,
            letterSpacing: 7,
            fontWeight: 800,
            textTransform: "uppercase",
            color: kickerCol,
            marginBottom: 40,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 84,
            fontWeight: 700,
            color: fg,
            lineHeight: 1.08,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 100,
            fontWeight: 700,
            color: GOLD,
            lineHeight: 1.06,
            marginTop: 8,
            textShadow: "0 6px 30px oklch(0.72 0.10 80 / 0.35)",
          }}
        >
          {accent}
        </div>
      </AbsoluteFill>

      {/* Bottom brand lockup */}
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 130 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 66,
              fontWeight: 700,
              color: GOLD,
              letterSpacing: 2,
            }}
          >
            Numevix
          </div>
          <div
            style={{
              background: GREEN,
              color: GREEN_FG,
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 34,
              padding: "12px 28px",
              borderRadius: 40,
              letterSpacing: 1,
            }}
          >
            numevix.com
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: SANS,
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: subCol,
          }}
        >
          AI Vedic Numerology · Reviewed by experts
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
