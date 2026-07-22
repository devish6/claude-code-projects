import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { TRANSITION } from "../timing";

export type TransitionType = "zoomIn" | "zoomOut" | "slide" | "spin";

/**
 * Camera motion between scenes. Wraps a scene and punches it on entry.
 *
 * Duration is TRANSITION (4 frames / 0.13s) by design — long enough to feel
 * like a cut with weight, short enough that it never reads as an animation.
 * This is the piece the original promos were missing: they cross-faded, which
 * costs ~15 frames of dead time per scene change.
 */
export const CinematicTransition: React.FC<{
  type?: TransitionType;
  durationInFrames?: number;
  children: React.ReactNode;
}> = ({ type = "zoomIn", durationInFrames = TRANSITION, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let transform = "";
  if (type === "zoomIn") {
    transform = `scale(${interpolate(p, [0, 1], [1.22, 1])})`;
  } else if (type === "zoomOut") {
    transform = `scale(${interpolate(p, [0, 1], [0.82, 1])})`;
  } else if (type === "slide") {
    transform = `translateX(${interpolate(p, [0, 1], [110, 0])}px)`;
  } else {
    transform = `rotate(${interpolate(p, [0, 1], [-7, 0])}deg) scale(${interpolate(
      p,
      [0, 1],
      [1.15, 1],
    )})`;
  }

  return (
    <div style={{ width: "100%", height: "100%", transform, transformOrigin: "center" }}>
      {children}
    </div>
  );
};
