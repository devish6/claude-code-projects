import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { HookBadge } from "./components/HookBadge";
import { AvatarVideo } from "./components/AvatarVideo";
import { Captions } from "./components/Captions";
import { CTAButton } from "./components/CTAButton";

export const TikTokAIAvatar: React.FC = () => {
  const frame = useCurrentFrame();

  // Global fade-out: frame 420 → 450
  const globalOpacity = interpolate(frame, [420, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      <Background />
      <AvatarVideo />
      <HookBadge />
      <Captions />
      <CTAButton />
    </AbsoluteFill>
  );
};
