import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DISPLAY, UI } from "../fonts";
import { usePalette } from "../PaletteContext";
import { Burst, useAberration, useCameraDrift, useGlowPulse } from "../motion";

export type HookVariant = "identity" | "contrarian" | "mystery";

/**
 * Frame 0 of every video. There is no intro, no logo, no fade — the first
 * rendered frame already contains large readable text that is already moving.
 *
 * `accent` is the word that carries the curiosity gap; it gets the gold + glow
 * so the eye lands on it before reading the rest of the line.
 */
export const ViralHook: React.FC<{
  text: string;
  accent?: string;
  subtext?: string;
  variant?: HookVariant;
  durationInFrames?: number;
  /**
   * Font overrides for non-Latin cuts. Cinzel and Inter carry no Devanagari,
   * so Hindi copy set in them renders as tofu boxes. Defaults reproduce the
   * previous hardcoded values exactly, so every existing video is unchanged.
   */
  displayFont?: string;
  uiFont?: string;
}> = ({
  text,
  accent,
  subtext,
  variant = "identity",
  durationInFrames = 60,
  displayFont = DISPLAY,
  uiFont = UI,
}) => {
  const P = usePalette();
  const frame = useCurrentFrame();
  const scale = useCameraDrift(durationInFrames, 1, 1.08);
  const ab = useAberration(0, 8, 10);
  const glow = useGlowPulse(
    variant === "contrarian" ? "rgba(150,40,20,0.35)" : "rgba(120,88,24,0.38)",
    1.2,
  );

  const accentColor = variant === "contrarian" ? P.ACCENT_ALERT : P.ACCENT;

  // Hard cut: text is at full size on frame 0, then settles. No opacity ramp.
  // 🔴🔴 `settle` IS the headline's entrance — it is the whole of it. The
  // headline used to ALSO be wrapped in <Burst>, which is a second entrance
  // stacked on the first, and at video frame 0 the two multiply into exactly
  // the thing this component's docstring promises never happens:
  //   · Burst's opacity is useSnapOpacity(0, 2) = interpolate(0, [0,2], [0,1])
  //     — literally 0 on frame 0, 0.5 on frame 1. FRAME 0 WAS EMPTY.
  //   · Burst's scale is spring-at-0 = 1.45, times settle's 1.12 = 1.62, so
  //     frame 1 showed the headline blown past BOTH frame edges, tilted -4deg.
  // Measured on a real render: frame 0 stddev 9.5, frame 1 16.98 (both under
  // qa-frame's floor of 18); frame 2 onward 21-28. `npm run qa:frame` was
  // failing on every V-series render and it was RIGHT — the floors are fine,
  // the opening was broken. This is the same class of defect as 7e65843, which
  // repaired the hook's SECOND detonation at the build boundary and left this,
  // the first one, on frame 0. Frame 0 is also the poster frame.
  // ⛔ Do not re-wrap the headline in Burst. Burst is for entrances that land
  // ON TOP of an already-populated frame (the accent at 5, the subtext at 10);
  // at frame 0 there is nothing behind it, so its ramp is a hole, not a cut.
  const settle = interpolate(frame, [0, 5], [1.12, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: 70,
        textAlign: "center",
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 112,
          fontWeight: 900,
          lineHeight: 1.02,
          color: P.TEXT,
          letterSpacing: -1,
          textShadow: P.TEXT_SHADOW,
          transform: `scale(${settle})`,
        }}
      >
        {/* Chromatic aberration: offset colour ghosts that decay in ~8 frames */}
        {ab > 0 ? (
          <>
            <span
              style={{
                position: "absolute",
                left: `calc(50% - ${ab}px)`,
                transform: "translateX(-50%)",
                color: "rgba(150,40,30,0.32)",
                width: "100%",
              }}
              aria-hidden
            >
              {text}
            </span>
            <span
              style={{
                position: "absolute",
                left: `calc(50% + ${ab}px)`,
                transform: "translateX(-50%)",
                color: "rgba(30,90,120,0.32)",
                width: "100%",
              }}
              aria-hidden
            >
              {text}
            </span>
          </>
        ) : null}
        <span style={{ position: "relative" }}>{text}</span>
      </div>

      {accent ? (
        <Burst delay={5}>
          <div
            style={{
              marginTop: 26,
              fontFamily: displayFont,
              fontSize: 128,
              fontWeight: 900,
              lineHeight: 1,
              color: accentColor,
              letterSpacing: -1,
              textShadow: glow,
            }}
          >
            {accent}
          </div>
        </Burst>
      ) : null}

      {subtext ? (
        <Burst delay={10}>
          <div
            style={{
              marginTop: 34,
              fontFamily: uiFont,
              fontSize: 52,
              fontWeight: 700,
              color: P.TEXT,
              opacity: 0.9,
              textShadow: P.TEXT_SHADOW,
            }}
          >
            {subtext}
          </div>
        </Burst>
      ) : null}
    </AbsoluteFill>
  );
};
