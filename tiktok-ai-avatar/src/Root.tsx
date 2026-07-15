import { Composition } from "remotion";
import { MoolankPromo } from "./MoolankPromo";
import { MOOLANKS } from "./moolank-data";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {Object.values(MOOLANKS)
        .sort((a, b) => a.n - b.n)
        .map((data) => (
          <Composition
            key={data.n}
            id={`Moolank-${data.n}`}
            component={MoolankPromo}
            durationInFrames={900}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ data }}
          />
        ))}
    </>
  );
};
