import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BrandAudio } from "../../components/kit";
import { MUSIC } from "../../lib/brand";
import { QUIET_DISPLAY, UI } from "../fonts";
import { FPS, sec } from "../timing";
import {
  DISSOLVE,
  type QuietScene,
  assertQuietRenderable,
  copyEntrance,
  groundOpacity,
  sceneOffsets,
  totalFrames,
} from "./scenes";

/**
 * The QUIET composition — one held sentence per ground, cross-dissolved.
 *
 * 🔴 CROSS-DISSOLVE, DELIBERATELY, AND IT CONTRADICTS THE KINETIC HEADER.
 * `KineticVideo.tsx` says "HARD CUT, NEVER A CROSS-FADE — the cut IS the
 * change", and that is correct THERE: kinetic's failure mode was a frame that
 * never changed, so a dissolve would have averaged two grounds into the exact
 * "nothing happened" frame it was fighting. This format has the opposite
 * failure mode. Its risk is a frame that changes so hard the feeling breaks,
 * and a 0.5s dissolve between 2.6s holds is the grammar every emotional short
 * in this niche actually uses. ⛔ Do not "harmonise" the two formats.
 *
 * ⭐⭐⭐ AND THE DISSOLVE IS ALSO THE BLACK-FRAME FIX. Because scene N+1 fades
 * IN underneath scene N fading OUT, ground opacity sums to ~1 at every frame of
 * the transition. There is no instant where nothing is lit. The kinetic format
 * got its black frame precisely because its copy — the only bright thing on a
 * dark ground — ramped from 0 at each cut with nothing behind it.
 *
 * 🪤 FRAME 0 IS THE POSTER FRAME. Scene 0 renders static, at full opacity, with
 * no entrance. This repo has shipped a blank frame 0 twice and `qa:frame` was
 * right both times. ⛔ Do not give scene 0 the same entrance as the rest.
 */

/** The push is slower than kinetic's 6% — the frame should breathe, not move. */
const GROUND_DRIFT = 0.045;

const SCRIMS = {
  // Ground already dark (night-*, violet-*, ember-*) — hold the scrim back or
  // the photograph is thrown away and we are typesetting on black.
  light:
    "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 38%, rgba(0,0,0,0.16) 62%, rgba(0,0,0,0.46) 100%)",
  normal:
    "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.26) 36%, rgba(0,0,0,0.34) 62%, rgba(0,0,0,0.72) 100%)",
  // 🪤 PALE GROUND (dawn-a, luma 115) NEEDS THE HEAVY ONE AND CREAM TYPE.
  // Measured, not reasoned: every scrim darkens DOWNWARD, so dark ink on a pale
  // ground fights it and contrast decays down the block — 2.7 / 2.4 / 1.9 / 1.4
  // against a 3.0:1 floor, i.e. the last line is invisible. Cream + heavy = 17.2:1.
  heavy:
    "linear-gradient(180deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.56) 40%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.78) 100%)",
} as const;

const Ground: React.FC<{
  scene: QuietScene;
  frames: number;
  isFirst: boolean;
  isLast: boolean;
}> = ({ scene, frames, isFirst, isLast }) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, frames], [1, 1 + GROUND_DRIFT], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: groundOpacity(f, frames, isFirst, isLast) }}>
      <Img
        src={staticFile(`grounds/${scene.bg}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill style={{ background: SCRIMS[scene.scrim ?? "normal"] }} />
    </AbsoluteFill>
  );
};

/**
 * ⭐ THE LINE, WITH ONE WORD IN THE ACCENT COLOUR.
 *
 * 🪤 SPLIT ON THE LITERAL, KEEPING THE SEPARATOR. A naive `replace` into
 * `dangerouslySetInnerHTML` would be the third injection-shaped footgun in this
 * repo; a naive `split(word)` drops the word itself. `checkAccentWords` has
 * already proved the substring is present, so the two-piece split below cannot
 * silently colour nothing.
 */
const Line: React.FC<{ text: string; accentWord?: string; accent?: string }> = ({
  text,
  accentWord,
  accent,
}) => {
  if (!accentWord || !accent) return <>{text}</>;
  const at = text.indexOf(accentWord);
  return (
    <>
      {text.slice(0, at)}
      <span style={{ color: accent, whiteSpace: "nowrap" }}>{accentWord}</span>
      {text.slice(at + accentWord.length)}
    </>
  );
};

/**
 * 🎯 CENTRED, SENTENCE CASE, ONE SENTENCE — AND EVERY PART OF THAT IS A CHANGE.
 *
 * Kinetic sets its copy left-aligned, UPPERCASE, in Cinzel, at 92–118px, with a
 * kicker over it and a `sub` under it. Frame 0 of the last seven posts is that
 * object. A viewer who has scrolled past six of them recognises it before they
 * read it — V43 and V44 opened on 99.5% identical pixels and V44's 1s hold
 * halved. The cheapest way to not be recognised is to not be the same shape.
 *
 * 🪤 THE TYPE SIZE IS THE PHONE'S CHROME, NOT TASTE. Instagram lays its caption
 * and the action rail over the video. Copy stays inside x = 110..970 and, once
 * centred, roughly y = 520..1400 of 1080x1920 — clear of the right-hand buttons
 * and the bottom caption band. ⛔ Do not widen it to "use the space".
 */
const Scene: React.FC<{
  scene: QuietScene;
  frames: number;
  isFirst: boolean;
  isLast: boolean;
}> = ({ scene, frames, isFirst, isLast }) => {
  const f = useCurrentFrame();
  const { opacity, lift } = copyEntrance(f, isFirst);
  // The under-line arrives after the main line has had time to be read. It is a
  // hold, so there is room for a real beat between them — this is the motion
  // that replaces kinetic's hard cut, and it is why a 2.6s scene is not static.
  const underIn = isFirst
    ? 1
    : interpolate(f, [sec(0.55), sec(0.95)], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return (
    <AbsoluteFill>
      <Ground scene={scene} frames={frames} isFirst={isFirst} isLast={isLast} />
      <AbsoluteFill
        style={{
          padding: "0 110px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          opacity,
          transform: `translateY(${lift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: QUIET_DISPLAY,
            // One sentence, so it may be set large; long lines step down rather
            // than wrap to four rows.
            fontWeight: 600,
            fontSize: scene.line.length > 46 ? 100 : scene.line.length > 30 ? 116 : 132,
            lineHeight: 1.16,
            color: scene.fg,
            // BALANCE THE WRAP. The first render broke "It's always 2 a.m."
            // after the "2", orphaning "A.M." on a line of its own - on the
            // recognition beat, the one line that has to land whole.
            textWrap: "balance",
            textShadow: "0 14px 48px rgba(0,0,0,0.68)",
          }}
        >
          <Line text={scene.line} accentWord={scene.accentWord} accent={scene.accent} />
        </div>

        {scene.under && (
          <div
            style={{
              fontFamily: UI,
              fontSize: 46,
              fontWeight: 500,
              lineHeight: 1.4,
              color: scene.fg,
              // ⛔ Never 0 — see `groundOpacity`. It arrives by settling, and
              // 0.34 is still legible against the scrim on frame 0 of the beat.
              opacity: 0.34 + 0.58 * underIn,
              marginTop: 34,
              maxWidth: 800,
              textShadow: "0 8px 30px rgba(0,0,0,0.7)",
            }}
          >
            {scene.under}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * 🔴 THE BED IS NOT OPTIONAL. The kinetic format's first cut shipped with NO
 * audio at all through 502 green tests — caught by the owner watching it, not by
 * any gate. Verify the encoded file, never the timeline.
 */
export const QUIET_MUSIC = MUSIC.kineticV18;

/**
 * 🪤 SCENES OVERLAP BY ONE DISSOLVE. Each `Sequence` is extended by `DISSOLVE`
 * frames and starts `DISSOLVE` early, so the outgoing and incoming grounds are
 * on screen together for exactly that window. Without the overlap the "dissolve"
 * is a fade to the black `AbsoluteFill` behind it and we have reinvented the
 * bug this format exists to avoid.
 */
export const QuietVideo: React.FC<{ scenes: QuietScene[] }> = ({ scenes }) => {
  const offsets = sceneOffsets(scenes);
  const total = totalFrames(scenes);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <BrandAudio src={QUIET_MUSIC} total={total} start={0} fadeIn={2} vol={0.42} fadeFloor={0.85} />
      {scenes.map((s, i) => {
        const isFirst = i === 0;
        // 🔴 The closing scene has no successor to cross-fade with, so it must
        //    not run an out-ramp. See `groundOpacity` — the first V50 render
        //    ended at mean luma 9.4 because this was missing.
        const isLast = i === scenes.length - 1;
        const from = isFirst ? 0 : offsets[i] - DISSOLVE;
        const dur = sec(s.seconds) + (isFirst ? 0 : DISSOLVE);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Scene scene={s} frames={dur} isFirst={isFirst} isLast={isLast} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** Gate + duration, so Root.tsx refuses to render a bad cut before frame 1. */
export const quietMetadata = (id: string, scenes: QuietScene[], payoffIndex: number) => {
  assertQuietRenderable(id, scenes, payoffIndex);
  return { durationInFrames: totalFrames(scenes), fps: FPS };
};
