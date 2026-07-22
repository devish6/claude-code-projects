import { Composition, Folder } from "remotion";
import { MoolankPromo } from "./MoolankPromo";
import { MOOLANKS } from "./moolank-data";

import { NameBlockingSuccess, NAME_BLOCKING_DURATION } from "./promos/NameBlockingSuccess";
import { BirthDateNotRandom, BIRTHDATE_DURATION } from "./promos/BirthDateNotRandom";
import { TrueNumber, TRUE_NUMBER_DURATION } from "./promos/TrueNumber";
import { NameVibration, NAME_VIBRATION_DURATION } from "./promos/NameVibration";
import { SecretNumberSuccess, SECRET_NUMBER_DURATION } from "./promos/SecretNumberSuccess";
import { CommentBirthday, COMMENT_BIRTHDAY_DURATION } from "./promos/CommentBirthday";
import { ProductDemo, PRODUCT_DEMO_DURATION } from "./promos/ProductDemo";
import { BirthVsDestiny, BIRTH_VS_DESTINY_DURATION } from "./promos/BirthVsDestiny";
import { WhySeven, WHY_SEVEN_DURATION } from "./promos/WhySeven";
import { BornWithStrengths, BORN_WITH_STRENGTHS_DURATION } from "./promos/BornWithStrengths";
import { Cover } from "./promos/Cover";

import { ViralVideo } from "./viral/ViralVideo";
import { ViralCover } from "./viral/ViralCover";
import {
  HOOK_TEST_COMPOSITIONS,
  VIRAL_COVERS,
  VIRAL_TEMPLATES,
} from "./viral/templates";
import { ACT } from "./viral/timing";

// 1080x1920, 30fps — vertical short-form for TikTok / Reels / Shorts.
const V = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
        Viral system (src/viral/*) — rebuilt to short-form retention timing:
        hard-cut hooks, ≤1.5s scenes, spring snaps instead of cross-fades.
        The Numevix-Promos folder below is the original slower cut, kept as an
        A/B baseline.
      */}
      <Folder name="Viral">
        {Object.entries(VIRAL_TEMPLATES).map(([id, props]) => (
          <Composition
            key={id}
            id={id}
            component={ViralVideo}
            durationInFrames={ACT.total}
            defaultProps={props}
            {...V}
          />
        ))}
      </Folder>

      {/*
        A/B set: ten hooks on the SAME V01 body. Ship 2-3 at a time, days
        apart — posting ten near-identical videos at once reads as repetitive
        and splits your own audience across them.
      */}
      <Folder name="Viral-HookTests">
        {Object.entries(HOOK_TEST_COMPOSITIONS).map(([id, props]) => (
          <Composition
            key={id}
            id={id}
            component={ViralVideo}
            durationInFrames={ACT.total}
            defaultProps={props}
            {...V}
          />
        ))}
      </Folder>

      <Folder name="Viral-Covers">
        {Object.entries(VIRAL_COVERS).map(([id, cover]) => (
          <Composition
            key={id}
            id={`${id}-Cover`}
            component={ViralCover}
            durationInFrames={60}
            defaultProps={{
              ...cover,
              variant: VIRAL_TEMPLATES[id as keyof typeof VIRAL_TEMPLATES].variant,
            }}
            {...V}
          />
        ))}
      </Folder>

      <Folder name="Numevix-Promos">
        <Composition
          id="01-NameBlockingSuccess"
          component={NameBlockingSuccess}
          durationInFrames={NAME_BLOCKING_DURATION}
          {...V}
        />
        <Composition
          id="02-BirthDateNotRandom"
          component={BirthDateNotRandom}
          durationInFrames={BIRTHDATE_DURATION}
          {...V}
        />
        <Composition
          id="03-TrueNumber"
          component={TrueNumber}
          durationInFrames={TRUE_NUMBER_DURATION}
          {...V}
        />
        <Composition
          id="04-NameVibration"
          component={NameVibration}
          durationInFrames={NAME_VIBRATION_DURATION}
          {...V}
        />
        <Composition
          id="05-SecretNumberSuccess"
          component={SecretNumberSuccess}
          durationInFrames={SECRET_NUMBER_DURATION}
          {...V}
        />
        <Composition
          id="06-CommentBirthday"
          component={CommentBirthday}
          durationInFrames={COMMENT_BIRTHDAY_DURATION}
          {...V}
        />
        <Composition
          id="07-ProductDemo"
          component={ProductDemo}
          durationInFrames={PRODUCT_DEMO_DURATION}
          {...V}
        />
        <Composition
          id="08-BirthVsDestiny"
          component={BirthVsDestiny}
          durationInFrames={BIRTH_VS_DESTINY_DURATION}
          {...V}
        />
        <Composition
          id="09-WhySeven"
          component={WhySeven}
          durationInFrames={WHY_SEVEN_DURATION}
          {...V}
        />
        <Composition
          id="10-BornWithStrengths"
          component={BornWithStrengths}
          durationInFrames={BORN_WITH_STRENGTHS_DURATION}
          {...V}
        />
      </Folder>

      <Folder name="Covers">
        <Composition
          id="Cover"
          component={Cover}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            variant: "ink" as const,
            kicker: "Numerology",
            title: "IS YOUR NAME",
            accent: "BLOCKING YOU?",
            watermark: "",
          }}
        />
      </Folder>

      <Folder name="Moolank">
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
      </Folder>
    </>
  );
};
