import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { HookBadge } from "./components/HookBadge";
import { AvatarVideo } from "./components/AvatarVideo";
import { Captions } from "./components/Captions";

export const TikTokAIAvatar: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <AvatarVideo />
      <HookBadge />
      <Captions />
    </AbsoluteFill>
  );
};
