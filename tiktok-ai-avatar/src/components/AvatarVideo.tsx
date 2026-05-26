import { AbsoluteFill, interpolate, useCurrentFrame, Video, staticFile } from "remotion";

export const AvatarVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          width: 800,
          height: 1000,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(78, 205, 196, 0.12)",
        }}
      >
        <Video
          src={staticFile("avatar-video.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};
