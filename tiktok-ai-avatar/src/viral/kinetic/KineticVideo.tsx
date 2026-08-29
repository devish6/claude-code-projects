import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BrandAudio } from "../../components/kit";
import { MUSIC } from "../../lib/brand";
import { DISPLAY, UI } from "../fonts";
import { FPS, sec } from "../timing";
import {
  type KineticScene,
  type KineticTable,
  assertKineticRenderable,
  sceneEntrance,
  sceneOffsets,
  totalFrames,
} from "./scenes";

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

const Ground: React.FC<{
  bg: string;
  frames: number;
  scrim: keyof typeof SCRIMS;
  push?: { from: number; to: number };
}> = ({ bg, frames, scrim, push }) => {
  const f = useCurrentFrame();
  // A slow push keeps a still photograph from reading as a still photograph.
  // 🪤 The DEFAULT is the original 1 -> 1.06 drift and must stay that way — V43
  //    and V44 are the format controls and neither one passes `push`.
  const from = push?.from ?? 1;
  const to = push?.to ?? 1 + GROUND_DRIFT;
  const scale = interpolate(f, [0, frames], [from, to], {
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

/**
 * ⭐⭐⭐ THE ARTEFACT ON SCREEN. See `KineticTable` in scenes.ts for why.
 *
 * 🪤 THE SIZES HERE ARE NOT TASTE, THEY ARE THE PHONE'S CHROME. Instagram lays
 * its caption and action rail over the video, so a grid that fills the frame is
 * a grid with a username through it. The whole artefact is kept inside
 * x = 96..844 and, once the block is centred, y ≈ 400..1520 of a 1080x1920
 * frame — clear of the right-hand button rail and the bottom caption band.
 * ⛔ Do not widen `CELL` to "use the space". The space is not ours.
 *
 * 🪤 AND IT MUST BE DRAWN STATIC ON SCENE 0. Frame 0 is the poster frame and
 * this repo has shipped it blank twice. The lit cell is the one thing that
 * animates, and it animates only on scenes 1+, where `isFirst` is false.
 */
const CELL = 72;
const HEADER = 56;

const KineticTableView: React.FC<{
  table: KineticTable;
  fg: string;
  accent: string;
  isFirst: boolean;
}> = ({ table, fg, accent, isFirst }) => {
  const f = useCurrentFrame();
  // The lit cell fades and swells in over ~9 frames. On the poster frame there
  // is no ramp at all — it is simply already lit.
  const lit = isFirst ? 1 : interpolate(f, [2, 11], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h = table.highlight;
  const isLit = (r: number, c: number) =>
    h ? (h.row === undefined || h.row === r) && (h.col === undefined || h.col === c) : false;

  const cellBox = (content: string, on: boolean, key: string) => (
    <div
      key={key}
      style={{
        width: CELL,
        height: CELL,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${on ? accent : "rgba(255,255,255,0.22)"}`,
        backgroundColor: on ? accent : "rgba(0,0,0,0.42)",
        opacity: on ? lit : 1,
        transform: on ? `scale(${0.86 + 0.14 * lit})` : "none",
        fontFamily: UI,
        fontSize: content.length > 1 ? 30 : 26,
        fontWeight: 700,
        color: on ? "#12100E" : fg,
      }}
    >
      {content}
    </div>
  );

  return (
    <div style={{ marginTop: 30 }}>
      {table.colTitle && (
        <div
          style={{
            fontFamily: UI,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: accent,
            marginLeft: HEADER + 44,
            marginBottom: 10,
          }}
        >
          {table.colTitle}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {table.rowTitle && (
          <div
            style={{
              width: 44,
              height: HEADER + table.rows.length * CELL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                transform: "rotate(-90deg)",
                whiteSpace: "nowrap",
                fontFamily: UI,
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {table.rowTitle}
            </div>
          </div>
        )}
        <div>
          {/* Column headers. The corner is deliberately empty — a label there
              reads as a cell and the viewer counts ten columns, not nine. */}
          <div style={{ display: "flex" }}>
            <div style={{ width: HEADER, height: HEADER }} />
            {table.cols.map((c, i) => (
              <div
                key={`c${i}`}
                style={{
                  width: CELL,
                  height: HEADER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: UI,
                  fontSize: 34,
                  fontWeight: 800,
                  color: h?.col === i ? accent : fg,
                  opacity: h?.col === i ? 1 : 0.75,
                  textShadow: "0 6px 20px rgba(0,0,0,0.85)",
                }}
              >
                {c}
              </div>
            ))}
          </div>
          {table.rows.map((r, ri) => (
            <div key={`r${ri}`} style={{ display: "flex" }}>
              <div
                style={{
                  width: HEADER,
                  height: CELL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: UI,
                  fontSize: 34,
                  fontWeight: 800,
                  color: h?.row === ri ? accent : fg,
                  opacity: h?.row === ri ? 1 : 0.75,
                  textShadow: "0 6px 20px rgba(0,0,0,0.85)",
                }}
              >
                {r}
              </div>
              {table.cells[ri].map((cell, ci) => cellBox(cell, isLit(ri, ci), `${ri}-${ci}`))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Scene: React.FC<{ scene: KineticScene; frames: number; isFirst: boolean }> = ({
  scene,
  frames,
  isFirst,
}) => {
  const f = useCurrentFrame();
  // 🪤 isFirst renders static — frame 0 is the poster frame and must be populated.
  const { opacity: enter, lift } = sceneEntrance(f, isFirst);

  return (
    <AbsoluteFill>
      <Ground bg={scene.bg} frames={frames} scrim={scene.scrim ?? "normal"} push={scene.push} />
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
              // 🪤 A scene carrying the artefact gives up type size to it. At
              //    118 a two-line claim plus a 9-row grid overruns 1920 and the
              //    bottom row lands under Instagram's caption band.
              fontSize: scene.table
                ? scene.headline.length > 30
                  ? 74
                  : 92
                : scene.headline.length > 34
                  ? 92
                  : 118,
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

        {scene.table && (
          <KineticTableView
            table={scene.table}
            fg={scene.fg}
            accent={scene.accent ?? scene.fg}
            isFirst={isFirst}
          />
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
