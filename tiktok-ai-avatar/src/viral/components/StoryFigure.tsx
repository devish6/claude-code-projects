import React from "react";
import { useCurrentFrame } from "remotion";
import { usePalette } from "../PaletteContext";
import { useFloat } from "../motion";

/**
 * A stylised character, drawn as SVG rather than imported as an asset.
 *
 * ⭐ WHY SVG AND NOT LOTTIE/RIVE, for the pilot: an SVG figure needs no new
 * dependency, no third-party asset licence, and no binary in a repo that is
 * public and Pages-served. It also stays DETERMINISTIC — the same frame
 * renders identically forever, which is the same property the rest of this
 * system depends on and the reason nothing here calls an AI at runtime.
 * If the format earns its place, @remotion/lottie is the upgrade path.
 *
 * The figure is deliberately faceless. A drawn face implies a specific person
 * — an age, an ethnicity, a gender — and the whole point of these stories is
 * that the viewer sees THEMSELVES in the combination. Posture carries the
 * emotion instead, which is also what makes it animate cheaply.
 */
export type Posture = "burdened" | "driven" | "open";

const POSTURES: Record<Posture, { lean: number; shoulder: number; armSwing: number }> = {
  // Curled forward, shoulders high — carrying something.
  burdened: { lean: 8, shoulder: -10, armSwing: 4 },
  // Leaning in, arms back — moving at something.
  driven: { lean: -10, shoulder: 4, armSwing: 22 },
  // Upright, shoulders down, arms wide — resolved.
  open: { lean: 0, shoulder: 8, armSwing: -14 },
};

export const StoryFigure: React.FC<{
  posture: Posture;
  /** 0..1 — how far this figure has travelled across frame. */
  progress?: number;
  scale?: number;
  /** A second figure behind, at lower opacity — used for "everyone else". */
  ghost?: boolean;
}> = ({ posture, progress = 0.5, scale = 1, ghost = false }) => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const { lean, shoulder, armSwing } = POSTURES[posture];

  // Walk cycle. A sine on the vertical axis reads as a step without needing
  // articulated legs — at this size, legs would be noise rather than detail.
  const step = Math.sin(frame / 5) * (posture === "driven" ? 5 : 2.5);
  const bob = useFloat(posture === "open" ? 5 : 2, 2.6);

  const ink = ghost ? p.TEXT_SOFT : p.TEXT;
  const accent = ghost ? p.TEXT_SOFT : p.ACCENT;

  return (
    <svg
      viewBox="0 0 120 220"
      style={{
        width: 120 * scale,
        opacity: ghost ? 0.28 : 1,
        transform: `translateX(${(progress - 0.5) * 420}px) translateY(${bob + step}px)`,
        overflow: "visible",
      }}
    >
      <g transform={`rotate(${lean} 60 200)`}>
        {/* legs — two strokes, offset by the step so they read as a stride */}
        <line x1="52" y1="150" x2={48 - step} y2="205" stroke={ink} strokeWidth="7" strokeLinecap="round" />
        <line x1="68" y1="150" x2={72 + step} y2="205" stroke={ink} strokeWidth="7" strokeLinecap="round" />

        {/* body */}
        <path
          d="M60 62 C 44 66, 40 100, 44 150 L 76 150 C 80 100, 76 66, 60 62 Z"
          fill={ink}
        />

        {/* arms — the swing is what sells the posture */}
        <line
          x1="46" y1="84"
          x2={40 - armSwing} y2={124 + shoulder}
          stroke={ink} strokeWidth="7" strokeLinecap="round"
        />
        <line
          x1="74" y1="84"
          x2={80 + armSwing} y2={124 + shoulder}
          stroke={ink} strokeWidth="7" strokeLinecap="round"
        />

        {/* head — no face, on purpose */}
        <circle cx="60" cy="40" r="22" fill={ink} />

        {/* The Sun sits above a driven or open figure: the number 1's planet,
            and a visual promise the copy then pays off. Never on "burdened" —
            that is the beat before the turn. */}
        {posture !== "burdened" && !ghost ? (
          <circle cx="60" cy="8" r="7" fill={accent} opacity={0.9} />
        ) : null}
      </g>
    </svg>
  );
};
