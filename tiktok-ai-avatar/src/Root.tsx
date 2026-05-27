import { Composition } from "remotion";
import { TikTokAIAvatar } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TikTokAIAvatar"
      component={TikTokAIAvatar}
      durationInFrames={390}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
