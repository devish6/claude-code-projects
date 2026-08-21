import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BrandAudio } from "../../components/kit";
import { MUSIC } from "../../lib/brand";
import { DISPLAY, UI } from "../fonts";
import { FPS, sec } from "../timing";
import { type KineticScene, assertKineticRenderable, sceneOffsets, totalFrames } from "./scenes";

/**
 * The KINETIC composition — a photographic ground per scene, hard-cut.
 *
 * 🔴 HARD CUT, NEVER A CROSS-FADE. The cut IS the change. A dissolve averages
 * two grounds together for its whole duration, which is exactly the "nothing
 * happened" frame this format exists to eliminate. `Sequence` gives us the cut
 * for free; do not add a fade between scenes.
 *
 * 🪤 FRAME 0 IS THE POSTER FRAME. Twice now this repo has shipped a video whose
 * first frame rendered no copy — `Burst`'s opacity ramp is exactly 0 at frame 0,
 * and `qa:frame` was right both times. So scene 0 renders its type STATIC, with
 * no entrance at all. Only scenes 1+ animate in. ⛔ Do not "tidy" this by giving
 * scene 0 the same entrance as the rest.
 *
 * 🎯 THE SCRIM IS NOT DECORATION. ember-* and violet-* are bright through the
 * middle, and editorial serif over a busy ground is the single clearest "cheap"
 * tell. Every scene gets a vertical dark scrim so type legibility does not
 * depend on which ground the scene drew.
 */

const GROUND_DRIFT = 0.06; // 6% slow push, so the frame moves even mid-scene

const SCRIMS = {
  // Ground already dark — a normal scrim would crush it to a black screen.
  light:
    "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 34%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.45) 100%)",
  normal:
    "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 32%, rgba(0,0,0,0.30) 58%, rgba(0,0,0,0.78) 100%)",
  // Pale ground (dawn) — light type needs a real ground to sit on.
  heavy:
    "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.80) 100%)",
} as const;

const Ground: React.FC<{ bg: string; frames: number; scrim: keyof typeof SCRIMS }> = ({ bg, frames, scrim }) => {
  const f = useCurrentFrame();
  // A slow push keeps a still photograph from reading as a still photograph.
  const scale = interpolate(f, [0, frames], [1, 1 + GROUND_DRIFT], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`grounds/${bg}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      {/* The scrim. See the header note — this is load-bearing for legibility. */}
      <AbsoluteFill style={{ background: SCRIMS[scrim] }} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ scene: KineticScene; frames: number; isFirst: boolean }> = ({
  scene,
  frames,
  isFirst,
}) => {
  const f = useCurrentFrame();
  // 🪤 isFirst renders static — frame 0 is the poster frame and must be populated.
  const enter = isFirst ? 1 : interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const lift = isFirst ? 0 : interpolate(f, [0, 7], [16, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Ground bg={scene.bg} frames={frames} scrim={scene.scrim ?? "normal"} />
      <AbsoluteFill
        style={{
          padding: "0 96px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          opacity: enter,
          transform: `translateY(${lift}px)`,
        }}
      >
        {scene.kicker && (
          <div
            style={{
              fontFamily: UI,
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: scene.accent ?? scene.fg,
              marginBottom: 28,
            }}
          >
            {scene.kicker}
          </div>
        )}

        {scene.digit !== undefined && (
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 460,
              lineHeight: 0.9,
              color: scene.accent ?? scene.fg,
              textShadow: "0 18px 60px rgba(0,0,0,0.55)",
              marginBottom: scene.sub ? 24 : 0,
            }}
          >
            {scene.digit}
          </div>
        )}

        {scene.headline && (
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: scene.headline.length > 34 ? 92 : 118,
              lineHeight: 1.06,
              color: scene.fg,
              textShadow: "0 12px 44px rgba(0,0,0,0.6)",
            }}
          >
            {scene.headline}
          </div>
        )}

        {scene.sub && (
          <div
            style={{
              fontFamily: UI,
              fontSize: 52,
              fontWeight: 600,
              lineHeight: 1.35,
              color: scene.fg,
              opacity: 0.92,
              marginTop: 22,
              textShadow: "0 8px 28px rgba(0,0,0,0.6)",
            }}
          >
            {scene.sub}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * 🔴 THE BED IS NOT OPTIONAL. The first cut of this format shipped with NO
 * audio at all — caught by the owner watching it, not by any gate. Every
 * V-series video carried a bed; the format rewrite dropped it silently because
 * ViralVideo mounts BrandAudio and this composition was written from scratch.
 *
 * `kineticV18` rather than V42's `helixV19`: the bed is part of the
 * fingerprint, and reusing the losing cut's bed on a format test muddies it.
 */
export const KINETIC_MUSIC = MUSIC.kineticV18;

export const KineticVideo: React.FC<{ scenes: KineticScene[] }> = ({ scenes }) => {
  const offsets = sceneOffsets(scenes);
  const total = totalFrames(scenes);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <BrandAudio src={KINETIC_MUSIC} total={total} start={0} fadeIn={2} vol={0.46} fadeFloor={0.85} />
      {scenes.map((s, i) => (
        <Sequence key={i} from={offsets[i]} durationInFrames={sec(s.seconds)}>
          <Scene scene={s} frames={sec(s.seconds)} isFirst={i === 0} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Gate + duration, so Root.tsx can refuse to render a bad cut before frame 1. */
export const kineticMetadata = (id: string, scenes: KineticScene[], payoffIndex: number) => {
  assertKineticRenderable(id, scenes, payoffIndex);
  return { durationInFrames: totalFrames(scenes), fps: FPS };
};
