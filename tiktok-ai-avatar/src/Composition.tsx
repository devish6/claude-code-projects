import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { HookBadge } from "./components/HookBadge";

export const TikTokAIAvatar: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <HookBadge />
    </AbsoluteFill>
  );
};
