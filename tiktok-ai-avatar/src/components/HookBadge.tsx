import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

export const HookBadge: React.FC = () => {
  const frame = useCurrentFrame();

  const translateY = interpolate(frame, [0, 15], [-80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 100,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          background: "rgba(78, 205, 196, 0.15)",
          border: "2px solid #4ecdc4",
          borderRadius: 50,
          padding: "18px 48px",
          color: "#4ecdc4",
          fontFamily: "sans-serif",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap" as const,
        }}
      >
        MADE WITH AI 🤖
      </div>
    </AbsoluteFill>
  );
};
