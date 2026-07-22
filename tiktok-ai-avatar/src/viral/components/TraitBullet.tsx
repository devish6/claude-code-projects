import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CREAM_ON_DARK, GOLD, GREEN } from "../../lib/brand";
import { TEXT_STROKE, UI } from "../fonts";
import { SlideIn, useFloat, useSpringAt } from "../motion";

/**
 * One trait. Slides in from the reading direction, its marker draws itself,
 * then it floats so it is never truly still.
 *
 * Text must be 3–7 words. Anything longer cannot be read at this pace and
 * becomes a wall the viewer scrolls past.
 */
export const TraitBullet: React.FC<{
  text: string;
  delay?: number;
  index?: number;
}> = ({ text, delay = 0, index = 0 }) => {
  const frame = useCurrentFrame();
  const s = useSpringAt(delay + 3, "snap");
  const floatY = useFloat(4, 2.6, index * 0.8);

  // Marker ring draws itself via strokeDashoffset.
  const CIRC = 2 * Math.PI * 26;
  const drawn = interpolate(s, [0, 1], [CIRC, 0]);
  const tickReveal = interpolate(frame - delay - 8, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SlideIn delay={delay} x={-90}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          transform: `translateY(${floatY}px)`,
        }}
      >
        <svg width={64} height={64} style={{ flexShrink: 0, overflow: "visible" }}>
          <circle
            cx={32}
            cy={32}
            r={26}
            fill="none"
            stroke={GREEN}
            strokeWidth={3}
            strokeDasharray={CIRC}
            strokeDashoffset={drawn}
            transform="rotate(-90 32 32)"
            style={{ filter: "drop-shadow(0 0 10px rgba(80,200,140,0.5))" }}
          />
          <path
            d="M20 33 L28 41 L44 24"
            fill="none"
            stroke={GOLD}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={40}
            strokeDashoffset={40 - tickReveal * 40}
          />
        </svg>
        <span
          style={{
            fontFamily: UI,
            fontSize: 64,
            fontWeight: 800,
            color: CREAM_ON_DARK,
            lineHeight: 1.2,
            textShadow: TEXT_STROKE,
          }}
        >
          {text}
        </span>
      </div>
    </SlideIn>
  );
};
