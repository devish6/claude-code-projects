import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

export const CTAButton: React.FC = () => {
  const frame = useCurrentFrame();

  // Springy entrance: frame 300 → 330
  const entranceScale = interpolate(frame, [300, 330], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  const entranceOpacity = interpolate(frame, [300, 318], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Continuous pulse after entrance: oscillates every 30 frames
  const pulseFrame = Math.max(0, frame - 330) % 30;
  const pulseScale = interpolate(pulseFrame, [0, 15, 30], [1, 1.06, 1], {
    extrapolateRight: "clamp",
  });

  const scale = frame < 330 ? entranceScale : pulseScale;
  const opacity = entranceOpacity;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 140,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          background: "#e94560",
          borderRadius: 60,
          padding: "32px 96px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        ❤️ Like & Follow
      </div>
    </AbsoluteFill>
  );
};
