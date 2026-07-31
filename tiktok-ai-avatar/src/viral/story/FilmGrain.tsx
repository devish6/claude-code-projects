import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/**
 * Animated film grain and drifting motes.
 *
 * These are the cheapest possible "this is footage, not a photo" cues and they do a
 * disproportionate amount of work on a still-image film. Grain in particular: a
 * perfectly clean upscaled render reads as a JPEG, and a lightly grained one reads as
 * a frame of a movie. It also usefully disguises the 1.41x upscale of the source.
 *
 * ⭐ The grain must CHANGE every frame. Static grain is worse than none — it looks like
 * dirt on the lens and, being identical frame to frame, it survives video compression
 * as a fixed pattern rather than dissolving into the image.
 */

const MOTES = 26;

export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.055 }) => {
  const frame = useCurrentFrame();

  // A new turbulence seed per frame is what makes the grain move. baseFrequency is high
  // so the noise is fine-grained rather than blotchy.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${frame % 97}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="240" height="240" filter="url(#n)"/>
  </svg>`;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundRepeat: "repeat",
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * Slow warm motes drifting upward. The generated stills already contain dust in light
 * shafts, so this continues a cue the images established rather than adding a new one.
 */
export const Motes: React.FC<{ count?: number }> = ({ count = MOTES }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        // Deterministic per-mote parameters — `random` with a stable seed keeps every
        // render identical, which matters because renders are compared frame-to-frame.
        const x = random(`x${i}`) * 100;
        const speed = 0.10 + random(`s${i}`) * 0.22;
        const size = 2 + random(`z${i}`) * 4.5;
        const phase = random(`p${i}`) * 1000;
        const sway = Math.sin((frame + phase) / (40 + random(`w${i}`) * 50)) * 14;
        // Wrap vertically so motes never run out over a long scene.
        const y = 100 - (((frame * speed + random(`y${i}`) * 100) % 115) - 7);
        const twinkle = 0.25 + 0.75 * Math.abs(Math.sin((frame + phase) / 55));

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "rgba(255, 226, 170, 0.9)",
              filter: "blur(1px)",
              opacity: twinkle * 0.5,
              transform: `translateX(${sway}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
