import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { HookBadge } from "./components/HookBadge";
import { AvatarVideo } from "./components/AvatarVideo";

export const TikTokAIAvatar: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <AvatarVideo />
      <HookBadge />
    </AbsoluteFill>
  );
};
