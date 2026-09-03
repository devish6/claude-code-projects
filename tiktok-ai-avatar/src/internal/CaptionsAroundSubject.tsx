import React, { useCallback, useEffect, useState } from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import { UI } from "../viral/fonts";
import { captionsFromText } from "./captions/captions-from-text";
import { TikTokCaptions, CAPTION_PRESETS } from "./captions/TikTokCaptions";

/**
 * ⭐⭐⭐⭐ CAPTIONS **AROUND** THE SUBJECT — THE ONE THE OWNER ACTUALLY MEANS.
 *
 * Owner, 2026-09-03, correcting the first attempt:
 *   "you see how my face covered the captions… the captions are AROUND the
 *    subject, not behind. Next time when I ask you to make something with
 *    animated captions, this is what I mean."
 *
 * The difference is not cosmetic. In the occlusion version the body eats the
 * words, and 85% of short-form is watched with sound off — so a word behind a
 * jaw is CONTENT LOST, not a stylish effect. Here the caption is placed in the
 * negative space the subject is not occupying and moves as they move, so every
 * word stays fully legible for the whole clip.
 *
 * ⭐⭐⭐ THE SAME MATTE DRIVES BOTH EFFECTS, USED TWO OPPOSITE WAYS:
 *
 *     person mask ──┬─→ composite ON TOP        = BEHIND   (CaptionsBehindSubject)
 *                   └─→ find where it ISN'T     = AROUND   (this file)
 *
 * `scripts/build-caption-placement.py` does the second: a coarse grid of
 * candidate caption boxes scored by how much subject falls inside each, with
 * TikTok's UI safe zones excluded BEFORE scoring, a mild centre bias so it
 * looks composed rather than shoved into a corner, and temporal smoothing plus
 * a dead-zone so the box holds still until there is a real reason to move.
 *
 * ⛔ THERE IS DELIBERATELY NO CUT-OUT LAYER HERE. Compositing the subject on
 * top would be belt-and-braces, and it would hide the failure mode instead of
 * showing it: if the placement is ever wrong, it should be VISIBLE that the
 * text overlapped, not quietly masked. The placement is the whole product.
 */

const CLIP = "talking/M1.mp4";
const PLACEMENT = "talking/placement-m1.json";
const CLIP_FRAMES = 104;

export const AROUND_SUBJECT_FRAMES = CLIP_FRAMES;

const LINE = "You're the one everyone comes to. You always pick up.";
const CAPTIONS = captionsFromText(LINE, { wordsPerSecond: 3.2 });

type Placement = { x: number; y: number };

/**
 * Positions the whole caption stack at this frame's slot.
 *
 * 🪤 THE OFFSET IS APPLIED HERE, AT THE TOP LEVEL, AND NOT INSIDE THE PAGES.
 * `TikTokCaptions` renders its pages inside `<Sequence>`, where
 * `useCurrentFrame()` is RELATIVE to the sequence — so a page cannot look up
 * its own absolute frame in the placement array without being handed the
 * offset. Translating the container instead keeps `TikTokCaptions` completely
 * unchanged and shared with the other two caption compositions.
 */
const Positioned: React.FC<{ path: Placement[] }> = ({ path }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = path[Math.min(Math.max(frame, 0), path.length - 1)];

  const dx = (p.x - 0.5) * width;
  const dy = (p.y - 0.5) * height;

  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>
      <TikTokCaptions captions={CAPTIONS} style={CAPTION_PRESETS.loud} />
    </AbsoluteFill>
  );
};

const Legend: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10], [0.55, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 62 }}>
      <div
        style={{
          fontFamily: UI,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: "#E8B36A",
          textTransform: "uppercase",
          opacity: o,
          textShadow: "0 6px 22px rgba(0,0,0,0.9)",
        }}
      >
        caption moves to the empty space
      </div>
    </AbsoluteFill>
  );
};

export const CaptionsAroundSubject: React.FC = () => {
  const [path, setPath] = useState<Placement[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  const load = useCallback(async () => {
    try {
      const res = await fetch(staticFile(PLACEMENT));
      setPath((await res.json()) as Placement[]);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile(CLIP)} muted />
      {path && <Positioned path={path} />}
      <Legend />
    </AbsoluteFill>
  );
};
