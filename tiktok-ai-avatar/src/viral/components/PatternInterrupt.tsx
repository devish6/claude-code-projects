import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";


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
    // Warm white bloom — a gold flash is invisible against a gold ground.
    const opacity = interpolate(p, [0, 0.25, 1], [0, 0.62, 0]);
    return <AbsoluteFill style={{ background: "#FFF8E4", opacity }} />;
  }

  if (type === "colorShift") {
    const opacity = interpolate(p, [0, 0.3, 1], [0, 0.35, 0]);
    return (
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(120deg, rgba(160,60,30,0.75), rgba(30,110,140,0.75))",
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
          "radial-gradient(ellipse 60% 60% at 50% 45%, transparent 40%, rgba(60,50,20,0.72) 100%)",
        opacity,
      }}
    />
  );
};
