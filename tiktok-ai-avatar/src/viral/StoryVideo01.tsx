import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { DISPLAY, UI } from "./fonts";
import { FilmGrain, Motes } from "./story/FilmGrain";
import { StoryCaptions } from "./story/StoryCaptions";
import { StoryFrame } from "./story/StoryFrame";
import { STORY_01_DURATION, STORY_01_SCENES } from "./story-01-data";

/**
 * Story Friday 01 — "When Your Number Repeats" (Root 1 · Destiny 1).
 *
 * Six AI-generated stills, the owner's cloned voice, and a camera. Replaces the
 * hand-authored SVG pilot, which was rejected on sight: the gap was never the code,
 * it was the assets, and no amount of drawing primitives was going to reach the brief.
 *
 * WHAT MAKES STILLS READ AS A FILM (in rough order of how much each contributes)
 *   1. captions locked to the voice — something changes every ~1.5s
 *   2. a continuous slow camera on every shot, never at rest
 *   3. per-frame film grain, which reads as footage rather than a photograph
 *   4. cross-dissolves rather than cuts — a cut between two stills exposes them as stills
 *   5. drifting motes, continuing a cue the images already contain
 *
 * 🔴 The story is a reading of `modules/numerology-engine/polarity.ts`, not invention:
 * a repeated number is a negative in nearly every chart, and 1 is the exception. It
 * describes the SHAPE of the combination and never forecasts an outcome — see the
 * script doc for the scene that had to be rewritten to keep that true.
 */

/** Cross-fade between scenes. Long enough to be a dissolve, short enough to keep pace. */
const DISSOLVE = 20;

const CTA_TEXT = "Comment your birth date 👇";

const Cta: React.FC<{ startAt: number }> = ({ startAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < startAt) return null;

  const enter = spring({
    frame: frame - startAt,
    fps,
    config: { damping: 200, stiffness: 140, mass: 0.7 },
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 430,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: UI,
          fontWeight: 900,
          fontSize: 58,
          color: "#FFF6E6",
          textAlign: "center",
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
          textShadow: "0 4px 18px rgba(0,0,0,0.85), 0 2px 5px rgba(0,0,0,0.95)",
        }}
      >
        {CTA_TEXT}
      </div>
    </AbsoluteFill>
  );
};

const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  // Fades in over the closing beat only. Present for the ending, absent for the story.
  const o = interpolate(frame, [STORY_01_DURATION - 110, STORY_01_DURATION - 80], [0, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o <= 0.01) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 320 }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: "0.30em",
          color: "#FFE6B8",
          opacity: o,
          textShadow: "0 2px 12px rgba(0,0,0,0.9)",
        }}
      >
        NUMEVIX
      </div>
    </AbsoluteFill>
  );
};

export const StoryVideo01: React.FC = () => {
  const frame = useCurrentFrame();
  const last = STORY_01_SCENES[STORY_01_SCENES.length - 1];
  const ctaStart = last.from + last.durationInFrames - 95;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/*
        Scenes are absolutely stacked rather than laid end to end in a <Series>, so
        consecutive scenes can OVERLAP and cross-dissolve. A Series butts them together,
        which forces a hard cut — and a hard cut between two photographs is exactly the
        moment a viewer notices nothing is moving.
      */}
      {STORY_01_SCENES.map((s, i) => {
        const start = s.from;
        const end = s.from + s.durationInFrames;
        // First scene fades up from black; the rest cross-fade over the previous one.
        const fadeInFrom = i === 0 ? start : start - DISSOLVE;
        if (frame < fadeInFrom - 2 || frame > end + 2) return null;

        const opacity = interpolate(
          frame,
          [fadeInFrom, i === 0 ? start + 26 : start + 4, end - DISSOLVE, end],
          [0, 1, 1, i === STORY_01_SCENES.length - 1 ? 1 : 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <AbsoluteFill key={s.id} style={{ opacity }}>
            <Sequence from={start} durationInFrames={s.durationInFrames} layout="none">
              <StoryFrame
                images={s.images}
                move={s.move}
                durationInFrames={s.durationInFrames}
              />
            </Sequence>
          </AbsoluteFill>
        );
      })}

      {/*
        Music bed — generated fresh for this video, never lifted from the shared MUSIC
        registry. Re-using an existing bed was one of the two specific faults called out
        on the rejected pilot, and a repeating bed is also part of the duplicate
        fingerprint that got the first TikTok account suppressed.

        🔴 GAIN IS MEASURED, NOT EYEBALLED. The generated bed came out at -18.6 dB mean
        against narration at -21.2 dB — i.e. LOUDER than the voice it has to sit under.
        0.147 puts it ~14 dB below the narration, which is the normal dialogue/score gap.
        If the bed is ever regenerated, re-measure: another render will not come back at
        the same level, and a bed mixed by eye will bury the story.
      */}
      <Audio
        src={staticFile("story/01/bed.mp3")}
        volume={(f) =>
          // Ease in over ~1s and out across the final beat, so the score neither slams in
          // over the first line nor stops dead on the CTA.
          0.147 *
          interpolate(f, [0, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
          interpolate(
            f,
            [STORY_01_DURATION - 70, STORY_01_DURATION - 6],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* Texture sits above the images but below the text, so captions stay crisp. */}
      <Motes />
      <FilmGrain />

      {/* Narration + captions, one Sequence per scene. Captions are authored relative to
          the scene, so the component never needs to know the global timeline. */}
      {STORY_01_SCENES.map((s) => (
        <Sequence
          key={`vo-${s.id}`}
          from={s.from}
          durationInFrames={s.durationInFrames}
          layout="none"
        >
          <Sequence from={s.audioOffsetInFrames} layout="none">
            <Audio src={staticFile(s.audio)} />
          </Sequence>
          <StoryCaptions captions={s.captions} />
        </Sequence>
      ))}

      <Cta startAt={ctaStart} />
      <Wordmark />

      {/* Close on black rather than on the last frame of an image. */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [STORY_01_DURATION - 14, STORY_01_DURATION], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
