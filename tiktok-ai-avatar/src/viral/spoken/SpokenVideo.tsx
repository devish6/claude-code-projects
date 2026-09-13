import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { Caption } from "@remotion/captions";

import { BrandAudio } from "../../components/kit";
import { MUSIC } from "../../lib/brand";
import { UI } from "../fonts";
import { FPS } from "../timing";
import { SCRIM_CSS } from "../quiet/scenes";
import {
  DISSOLVE,
  GROUND_DRIFT,
  type SpokenScene,
  assertSpokenRenderable,
  groundOpacity,
  scenePageCaptions,
  sceneFrames,
  sceneOffsets,
  totalFrames,
} from "./scenes";

/**
 * The SPOKEN composition — continuous prose, word-lit, over photographic grounds.
 *
 * ⭐⭐⭐ WHAT IS BORROWED AND WHAT IS NOT. The ground stack, the constant scrim
 * and the cross-dissolve come from the quiet format because they are correctness
 * machinery, not style: the dissolve is what makes a black frame structurally
 * impossible, and the constant scrim is what stops the luma ladder flattening.
 * The TYPE is entirely different — Inter 800 at 74px in moving pages, against
 * quiet's static Cormorant sentence at 100-132px. That difference is the whole
 * point of the format: the cheapest way not to be recognised is not to be the
 * same shape.
 *
 * ⭐⭐⭐⭐ WHY THIS DRAWS ITS OWN PAGES INSTEAD OF USING `TikTokCaptions`.
 * Two independent reasons, and the first is a correctness bug:
 *
 *  1. `TikTokCaptions` places each page in a `Sequence` at an ABSOLUTE frame
 *     derived from `page.startMs`. Wrapping it per page — which is what a
 *     clause-based pager needs — would apply that offset twice and every page
 *     after the first would drift later by its own start time.
 *  2. Its paging is `createTikTokStyleCaptions`, which groups purely by time and
 *     produced THREE one-word orphan pages on this cut's prose. The rule here is
 *     clause-based (`scenePageCaptions`), so the renderer must consume pages, not
 *     re-derive them.
 *
 * ⛔ `TikTokCaptions` is therefore left completely untouched — it is shared with
 * the Internal caption proofs, and this format's needs are genuinely different.
 */

/**
 * 🔴 THE BED IS NOT OPTIONAL. The kinetic format's first cut shipped with NO
 * audio at all through 502 green tests — caught by the owner watching it, not by
 * any gate. Verify the encoded file, never the timeline.
 *
 * ⭐ `sweetMemories` is the registered emotional bed and has never been used on
 * a quiet cut, so the account does not sound like a repeat. ⛔ It is declared
 * here rather than by editing `QUIET_MUSIC`: that constant feeds all seven
 * published quiet cuts and is pinned by no test, so changing it would silently
 * re-score V50-V60 — the only controls this account owns.
 */
export const SPOKEN_MUSIC = MUSIC.sweetMemories;

const SCRIMS = SCRIM_CSS;
const FONT_SIZE = 74;
/** How much the lit word grows. 1.04, not the reference look's 1.16. */
const POP = 1.04;

const Ground: React.FC<{
  scene: SpokenScene;
  frames: number;
  isFirst: boolean;
  isLast: boolean;
}> = ({ scene, frames, isFirst, isLast }) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, frames], [1, 1 + GROUND_DRIFT], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ overflow: "hidden", opacity: groundOpacity(f, frames, isFirst, isLast) }}
    >
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
 * One page of prose, with the word currently being spoken lit.
 *
 * 🪤 THE PAGE NEVER FADES FROM ZERO OPACITY. It arrives by SCALE only. On these
 * grounds the type is a large share of the frame's light, and kinetic shipped a
 * mean-luma-7.05 frame precisely by ramping copy from 0. ⭐ And `isStatic` holds
 * even the scale at 1 for the very first page, because frame 0 is the poster
 * frame and this repo has shipped it wrong twice.
 *
 * 🪤 `whiteSpace: "pre"` is load-bearing. `captionsFromText` keeps the leading
 * space INSIDE each token; trim it or set `normal` and every word runs together.
 */
const PageBlock: React.FC<{
  page: Caption[];
  fg: string;
  accent: string;
  isStatic: boolean;
}> = ({ page, fg, accent, isStatic }) => {
  const frame = useCurrentFrame();
  const pageStartMs = page[0].startMs;
  const absoluteMs = pageStartMs + (frame / FPS) * 1000;
  const enter = isStatic
    ? 1
    : interpolate(frame, [0, 5], [0.82, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px" }}>
      <div
        style={{
          fontFamily: UI,
          fontWeight: 800,
          fontSize: FONT_SIZE,
          lineHeight: 1.18,
          textAlign: "center",
          whiteSpace: "pre",
          textWrap: "balance",
          letterSpacing: -0.5,
          color: fg,
          textShadow: "0 10px 40px rgba(0,0,0,0.85)",
          transform: `scale(${enter})`,
        }}
      >
        {page.map((c) => {
          const active = c.startMs <= absoluteMs && c.endMs > absoluteMs;
          // The pop is driven by how far INTO the word we are, so it rises and
          // settles rather than snapping on and off.
          const t = active
            ? interpolate(absoluteMs, [c.startMs, c.endMs], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;
          const scale = active ? 1 + (POP - 1) * Math.sin(Math.PI * Math.min(1, t * 1.6)) : 1;
          return (
            <span
              key={`${c.startMs}-${c.text}`}
              style={{
                display: "inline-block",
                color: active ? accent : fg,
                transform: `scale(${scale})`,
                transformOrigin: "center bottom",
              }}
            >
              {c.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Scene: React.FC<{
  scene: SpokenScene;
  frames: number;
  isFirst: boolean;
  isLast: boolean;
}> = ({ scene, frames, isFirst, isLast }) => {
  const pages = scenePageCaptions(scene);
  /**
   * 🔴 THE CAPTION TIMELINE IS SCENE-RELATIVE, BUT A NON-FIRST SCENE'S SEQUENCE
   * STARTS `DISSOLVE` FRAMES EARLY so the grounds can cross-fade. Without this
   * offset every page after scene 0 would arrive half a second before its own
   * ground had finished appearing.
   */
  const offset = isFirst ? 0 : DISSOLVE;

  return (
    <AbsoluteFill>
      <Ground scene={scene} frames={frames} isFirst={isFirst} isLast={isLast} />
      {pages.map((page, i) => {
        const from = Math.round((page[0].startMs / 1000) * FPS) + offset;
        const next = pages[i + 1];
        // 🔴 THE LAST PAGE IS UNCAPPED, so it holds to the end of the scene
        // instead of expiring into a bare plate — the defect `qa-frame` caught
        // at frame 227 of the caption proof. Every other page runs until the
        // next one starts, which is gap-free by construction.
        const durationInFrames = next
          ? Math.round((next[0].startMs / 1000) * FPS) + offset - from
          : undefined;
        if (durationInFrames !== undefined && durationInFrames <= 0) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <PageBlock
              page={page}
              fg={scene.fg}
              accent={scene.accent}
              isStatic={isFirst && i === 0}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * 🪤 SCENES OVERLAP BY ONE DISSOLVE. Each `Sequence` is extended by `DISSOLVE`
 * frames and starts `DISSOLVE` early, so the outgoing and incoming grounds share
 * the frame for exactly that window. Without the overlap the "dissolve" is a
 * fade to the black `AbsoluteFill` behind it, and we have rebuilt the bug this
 * machinery exists to prevent.
 */
export const SpokenVideo: React.FC<{ scenes: SpokenScene[] }> = ({ scenes }) => {
  const offsets = sceneOffsets(scenes);
  const total = totalFrames(scenes);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: UI }}>
      <BrandAudio
        src={SPOKEN_MUSIC}
        total={total}
        start={0}
        fadeIn={2}
        vol={0.42}
        fadeFloor={0.85}
      />
      {scenes.map((s, i) => {
        const isFirst = i === 0;
        const isLast = i === scenes.length - 1;
        const from = isFirst ? 0 : offsets[i] - DISSOLVE;
        const dur = sceneFrames(s) + (isFirst ? 0 : DISSOLVE);
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
export const spokenMetadata = (id: string, scenes: SpokenScene[], payoffIndex: number) => {
  assertSpokenRenderable(id, scenes, payoffIndex);
  return { durationInFrames: totalFrames(scenes), fps: FPS };
};
