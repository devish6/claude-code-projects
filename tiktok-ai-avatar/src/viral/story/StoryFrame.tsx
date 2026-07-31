import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

import type { StoryScene } from "../story-01-data";

/**
 * One still, given a camera.
 *
 * The whole format rests on this: six photographs have to feel like a film. Everything
 * here exists to stop the eye registering "this is a static picture" —
 *
 *   - a slow continuous camera move, never at rest;
 *   - a vignette that breathes, so even the edges are alive;
 *   - film grain, which is the single strongest cue that something is *footage*.
 *
 * 🔴 SCALE IS CAPPED AT 1.06 BY THE SOURCE, NOT BY TASTE. The images are 768x1376 and
 * the frame is 1080x1920, so `cover` already upscales 1.41x before any move. A 1.12 push
 * — comfortable on a 2K source — would put the peak near 1.6x and the softness becomes
 * visible on a phone. If the generator ever offers 2K, this cap can rise.
 */

/** Peak camera scale on top of the 1.41x the source already needs. */
const MOVE = 0.06;
/** A gentler push for the closing beat, so the video settles rather than accelerates. */
const MOVE_SLOW = 0.035;

type Move = StoryScene["move"];

function cameraFor(move: Move, t: number) {
  // t is 0..1 across the scene.
  switch (move) {
    case "pushIn":
      return { scale: 1 + MOVE * t, x: 0, y: 0 };
    case "pushInSlow":
      return { scale: 1 + MOVE_SLOW * t, x: 0, y: 0 };
    case "pullBack":
      // Starts wide-ish and settles. Reads as the world opening up rather than closing in.
      return { scale: 1 + MOVE * (1 - t), x: 0, y: 0 };
    case "driftLeft":
      // Held scale with lateral travel — for the storm, where a push-in would feel like
      // approaching something rather than being pushed sideways by wind.
      return { scale: 1 + MOVE * 0.8, x: interpolate(t, [0, 1], [26, -26]), y: 0 };
  }
}

export const StoryFrame: React.FC<{
  images: string[];
  move: Move;
  durationInFrames: number;
  /**
   * Frames of cross-fade when a scene holds more than one image.
   *
   * 🔴 KEEP THIS SHORT — 10, not the 22 used between scenes. The three scene-4 figures
   * are separately generated and do NOT share an exact scale, so a long cross-fade holds
   * two offset silhouettes on screen and reads as a render fault rather than a
   * transition. Caught by looking at the rendered film, not the component.
   *
   * The honest alternative — normalising the figures — needs a reliable silhouette
   * measurement, and the obvious one (thresholding for dark pixels) locks onto the
   * vignette instead of the figure. A short dissolve solves it without that machinery.
   */
  innerDissolve?: number;
}> = ({ images, move, durationInFrames, innerDissolve = 10 }) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames - 1)));
  const cam = cameraFor(move, t);

  // Multi-image scenes (scene 4) split the scene evenly and cross-dissolve. The camera
  // keeps running across the whole scene rather than restarting per image — that is what
  // makes three separate photographs read as one continuous shot through three rooms.
  const slot = durationInFrames / images.length;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {images.map((name, i) => {
        const start = i * slot;
        const opacity =
          images.length === 1
            ? 1
            : interpolate(
                frame,
                [start - innerDissolve, start, start + slot - innerDissolve, start + slot],
                [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
        if (opacity <= 0.001) return null;
        return (
          <AbsoluteFill key={name} style={{ opacity }}>
            <Img
              src={staticFile(`story/01/${name}.png`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${cam.scale}) translate(${cam.x}px, ${cam.y}px)`,
                transformOrigin: "center center",
              }}
            />
          </AbsoluteFill>
        );
      })}

      {/* Vignette. Slight breathing keeps the corners from reading as a fixed frame. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) ${
            48 + Math.sin(t * Math.PI * 2) * 3
          }%, rgba(0,0,0,0.55) 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
