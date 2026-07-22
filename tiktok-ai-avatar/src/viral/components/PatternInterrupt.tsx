import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { GOLD_BRIGHT } from "../../lib/brand";

export type InterruptType = "flash" | "shake" | "zoom" | "colorShift";

/**
 * Attention reset. Fire one every ~3.5s.
 *
 * These are meant to be *felt, not seen* — 6–12 frames. If a viewer can
 * describe the effect, it ran too long.
 *
 * Note: `shake` and `zoom` are transform effects that must be applied by the
 * PARENT (via useShake / useCameraDrift) — this component renders only the
 * full-frame overlays, so it can sit above content without clipping it.
 */
export const PatternInterrupt: React.FC<{
  type?: InterruptType;
  durationInFrames?: number;
}> = ({ type = "flash", durationInFrames = 9 }) => {
  const frame = useCurrentFrame();
  if (frame > durationInFrames) return null;

  const p = frame / durationInFrames;

  if (type === "flash") {
    const opacity = interpolate(p, [0, 0.25, 1], [0, 0.55, 0]);
    return <AbsoluteFill style={{ background: GOLD_BRIGHT, opacity }} />;
  }

  if (type === "colorShift") {
    const opacity = interpolate(p, [0, 0.3, 1], [0, 0.35, 0]);
    return (
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(120deg, rgba(255,60,60,0.8), rgba(60,200,255,0.8))",
          mixBlendMode: "overlay",
          opacity,
        }}
      />
    );
  }

  // shake / zoom render a brief vignette punch; the transform lives on the parent.
  const opacity = interpolate(p, [0, 0.2, 1], [0, 0.4, 0]);
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 60% 60% at 50% 45%, transparent 40%, rgba(0,0,0,0.9) 100%)",
        opacity,
      }}
    />
  );
};
