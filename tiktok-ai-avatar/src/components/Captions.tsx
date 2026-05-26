import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { CAPTION_LINES } from "../lib/captions";

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();

  const activeLine = CAPTION_LINES.find(
    (line) => frame >= line.startFrame && frame < line.endFrame
  ) ?? null;

  if (!activeLine) return null;

  const opacity = interpolate(
    frame,
    [activeLine.startFrame, activeLine.startFrame + 8],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 300,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          background: "rgba(0, 0, 0, 0.65)",
          borderRadius: 16,
          padding: "20px 48px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          fontSize: 48,
          fontWeight: 500,
          lineHeight: 1.4,
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        {activeLine.text}
      </div>
    </AbsoluteFill>
  );
};
