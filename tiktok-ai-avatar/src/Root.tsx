import { Composition } from "remotion";
import { TikTokAIAvatar } from "./Composition";
import { TikTokPromo } from "./TikTokPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TikTokAIAvatar"
        component={TikTokAIAvatar}
        durationInFrames={390}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TikTokPromo"
        component={TikTokPromo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
