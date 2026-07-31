import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { UI } from "../fonts";
import type { StoryCaption } from "../story-01-data";

/**
 * Spoken-word captions, timed from ElevenLabs' own character alignment.
 *
 * WHY THEY CARRY THE FORMAT
 * -------------------------
 * On a still-image film the captions are not an accessibility afterthought, they are a
 * second motion system. The camera move is deliberately slow (it has to be — see the
 * scale cap in StoryFrame), so the captions supply the rhythm: something changes on
 * screen every ~1.5s, locked to the voice.
 *
 * They also earn their keep on reach. Most short-form is watched muted, and a narrated
 * story with no captions is simply unreadable to that viewer — the entire script would
 * be lost.
 *
 * PLACEMENT
 * ---------
 * Sits above the platform furniture: TikTok's own caption/handle block runs along the
 * bottom ~15% and the action rail down the right. `layout.tsx` uses HEIGHT * 0.16 for
 * safeBottom; this clears it with room to spare, and stays centred so the right rail
 * never overlaps mid-line.
 */

/** Words stagger in by this many frames each — small enough to read as one motion. */
const WORD_STAGGER = 1.6;

export const StoryCaptions: React.FC<{ captions: StoryCaption[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const active = captions.find((c) => frame >= c.from - 4 && frame <= c.to + 9);
  if (!active) return null;

  const enter = spring({
    frame: frame - active.from,
    fps,
    config: { damping: 200, stiffness: 190, mass: 0.55 },
  });

  // Fade out slightly after the word finishes, so the card does not vanish on the
  // syllable — a caption that disappears exactly on the last phoneme reads as a glitch.
  const exit = interpolate(frame, [active.to + 2, active.to + 9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const words = active.text.split(" ");

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 430,
        paddingLeft: 90,
        paddingRight: 90,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0 18px",
          justifyContent: "center",
          opacity: exit,
          transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px)`,
        }}
      >
        {words.map((w, i) => {
          const wEnter = spring({
            frame: frame - active.from - i * WORD_STAGGER,
            fps,
            config: { damping: 200, stiffness: 190, mass: 0.55 },
          });
          return (
            <span
              key={`${w}-${i}`}
              style={{
                fontFamily: UI,
                fontWeight: 900,
                fontSize: 68,
                lineHeight: 1.18,
                color: "#FFF6E6",
                letterSpacing: "-0.01em",
                opacity: wEnter,
                transform: `scale(${interpolate(wEnter, [0, 1], [0.86, 1])})`,
                // A drop shadow rather than an outline: these images are dark and warm,
                // and a hard stroke would fight the soft cinematic grade. The shadow is
                // doubled so the text survives both dark and bright backgrounds.
                textShadow:
                  "0 4px 18px rgba(0,0,0,0.85), 0 2px 5px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.5)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
